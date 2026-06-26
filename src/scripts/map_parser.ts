// Google GenAI
import { GoogleGenAI } from '@google/genai'
import type { GenerateContentResponse } from '@google/genai'

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
})

export async function parseMap(mapUrl: string, companyId: number, jobId: number) {
  console.log(`[Map parser, Worker ${jobId}] Start parsing map and getting points`)

  await using view = new Bun.WebView({ backend: 'chrome' }) // Bun Webview for virtual browser
  try {
    // Validate the search query
    if (typeof mapUrl !== 'string') {
      console.error(`❌ [Map Parser, Worker ${jobId}] Invalid search query`)
      return { success: false, status: 400, message: 'Формат URL неправильный' }
    }

    await view.navigate(mapUrl) // Navigate to Yandex maps website
    await Bun.sleep(5000) // Wait for the page to load

    // Scroll function (load all cards)
    // Interface for results
    interface ScrollResult {
      isBottomReached?: boolean
      status: number
      message: string
    }

    // While for scrolling to the bottom and every 400 pixels scroll-function stop to load cards
    while (true) {
      let scrollResult: ScrollResult
      try {
        scrollResult = (await view.evaluate(`
          (() => {
            // Find the scroll container
            const container = document.querySelector('.scroll__container');
            
            if (!container) {
              return { status: 404, message: "There is not a scroll__container" };
            }
            
            const scrollBefore = container.scrollTop;
            
            // Scroll down by 400 pixels
            container.scrollTop += 400;
            
            const scrollAfter = container.scrollTop;
            const maxScrollPossible = container.scrollHeight - container.clientHeight;

            // Check if we've reached the bottom (allowing a small threshold of 5 pixels)
            const isBottomReached = (scrollBefore === scrollAfter) || (scrollAfter >= maxScrollPossible - 5);

            return {
              status: 200,
              isBottomReached: isBottomReached,
              message: isBottomReached ? "Bottom is reached" : "Scroll function continue working"
            };
          })()
        `)) as ScrollResult
      } catch (evaluateError) {
        console.error(
          `❌ [Map Parser, Worker ${jobId}] Error of scrolling function:`,
          evaluateError,
        )
        break
      }

      // If container disappear
      if (scrollResult.status === 404) {
        console.error(`❌ Error inside page: ${scrollResult.message}`)
        break
      }

      // If function reached bottom
      if (scrollResult.isBottomReached) {
        console.log(`Scrolling function completed: ${scrollResult.message}`)
        break
      }
      await Bun.sleep(5000) // again load all cards
    }

    // Extract the page content after scrolling
    const pageContent = await view.evaluate(`
      (() => {
        const listElement = document.querySelector('.search-list-view__list')
                         || document.querySelector('.scroll__container');
        return listElement ? listElement.outerHTML : null;
      })()
    `)

    view.close() // Close the WebView

    const response: GenerateContentResponse = await googleGenAI.models.generateContent({
      model: 'gemini-3.5-flash',
      contents:
        `Hi! Can you parse this HTML and create JSON without additional text? There the fields which you must create: companyId(${companyId}), name(String), address(String), createdAt(DateTime), deletedAt(DateTime, set null),yandexId(String) and lastParseAt(null). Please make it always Array of cards. Here is the HTML content: ` +
        pageContent,
    })
    if (!response.text) {
      console.error(
        `❌ [Map Parser, Worker ${jobId}] Gemini returned an empty response or undefined!`,
      )
      return {
        success: false,
        status: 400,
        message: `Gemini returned an empty response or undefined`,
      }
    }

    // Clean the response text to ensure it's valid JSON before parsing
    let parsedData
    try {
      let cleanJsonString = response.text.trim()
      if (cleanJsonString.includes('```')) {
        cleanJsonString = cleanJsonString
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
      }

      parsedData = JSON.parse(cleanJsonString)
    } catch (error) {
      console.error(`❌ [Map Parser, Worker ${jobId}] Error occurred while parsing JSON:`, error)
      return { success: false, status: 500, message: 'Error occurred while parsing JSON' }
    }

    console.log(`\n✅ [Map Parser, Worker ${jobId}] Parsing completed successfully.`)
    return {
      success: true,
      status: 200,
      message: 'Точки заведения успешно спарсены',
      data: parsedData,
    }
  } catch (error) {
    console.error(`❌ [Map Parser, Worker ${jobId}] Error occurred while parsing map:`, error)
    return { success: false, status: 500, message: 'Error occurred while parsing map' }
  }
}

export async function parseReviews(yandexId: string, pointId: number, jobId: number) {
  console.log(`[Review Parser, Worker ${jobId}] Start parsing page of reviews and getting reviews`)
  await using view = new Bun.WebView({ backend: 'chrome' }) // Bun Webview for virtual browser
  try {
    // Navigate to Yandex maps website with yandexId of point
    await view.navigate(`https://yandex.uz/maps/org/adiba/${yandexId}/reviews/`)
    await Bun.sleep(5000) // Wait for the page to load

    // Set Sort from new to old
    // Interface for result
    interface SortResult {
      success: false
      status: number
      message: string
    }

    const resultOfSort: SortResult = await view.evaluate(`
      (async () => {
        const sortButton = document.querySelector('.rating-ranking-view')
        if (!sortButton) {
          return { success: false, status: 404, message: 'Не удалось найти кнопку сортировки' }
        }
        sortButton.click()

        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Find button "По новизне"
        const options = document.querySelectorAll('.rating-ranking-view__popup-line')
        const newSortOption = options[1]
        if (!newSortOption) {
          return { success: false, status: 404, message: "Не удалось найти кнопку 'По новизне'" }
        }
        newSortOption.click()

        await new Promise((resolve) => setTimeout(resolve, 2000))
        return { success: true, status: 200, message: 'Сортировка изменена' }
      })()
    `)
    if (resultOfSort.status === 404) return resultOfSort

    // Scroll function (we must to load last reviews)
    // Interface for results
    interface ScrollResult {
      isBottomReached?: boolean
      status: number
      message: string
    }
    let step = 0

    // While for scrolling to the bottom and every 400 pixels scroll-function stop to load reviews
    while (true) {
      let scrollResult: ScrollResult
      try {
        scrollResult = (await view.evaluate(`
          (() => {
            // Find the scroll container
            const container = document.querySelector('.scroll__container');
            
            if (!container) {
              return { status: 404, message: "There is not a scroll__container" };
            }
            
            const scrollBefore = container.scrollTop;
            
            // Scroll down by 400 pixels
            container.scrollTop += 400;
            
            const scrollAfter = container.scrollTop;
            const maxScrollPossible = container.scrollHeight - container.clientHeight;

            // Check if we've reached the bottom (allowing a small threshold of 5 pixels)
            const isBottomReached = (scrollBefore === scrollAfter) || (scrollAfter >= maxScrollPossible - 5);

            return {
              status: 200,
              isBottomReached: isBottomReached,
              message: isBottomReached ? "Bottom is reached" : "Scroll function continue working"
            };
          })()
        `)) as ScrollResult
      } catch (evaluateError) {
        console.error(
          `❌ [Review Parser, Worker ${jobId}] Error of scrolling function:`,
          evaluateError,
        )
        break
      }

      // If container disappear
      if (scrollResult.status === 404) {
        console.error(
          `❌ [Review Parser, Worker ${jobId}] Error inside page: ${scrollResult.message}`,
        )
        break
      }

      if (step === 1) {
        console.log(`[Review Parser, Worker ${jobId}] Scrolling function completed`)
        break
      }

      if (scrollResult.isBottomReached) {
        console.log(`[Review Parser, Worker ${jobId}] Scrolling function completed`)
        break
      }
      await Bun.sleep(5000) // again load all cards
      step++
    }

    // Extract the page content after scrolling
    const pageContent = await view.evaluate(`
      (() => {
        const listElement = document.querySelector('.business-reviews-card-view__reviews-container')
                         || document.querySelector('.scroll__container');
        return listElement ? listElement.outerHTML : null;
      })()
    `)

    // Close the WebView
    view.close()

    const response: GenerateContentResponse = await googleGenAI.models.generateContent({
      model: 'gemini-3.5-flash',
      contents:
        `Hi! Can you parse this HTML and create JSON without additional text? There the fields which you must create: companyPointId(${pointId}), reviewerName(String), content(String), rating(Int from 1 to 5), createdAt(Date), aiAnswer(just empty String). Please make it always Array of reviews. Here is the HTML content: ` +
        pageContent,
    })

    if (!response.text) {
      console.error(
        `❌ [Review Parser, Worker ${jobId}] Gemini returned an empty response or undefined!`,
      )
      return {
        success: false,
        status: 400,
        message: `Gemini returned an empty response or undefined!`,
      }
    }

    // Clean the response text to ensure it's valid JSON before parsing
    let parsedData
    try {
      let cleanJsonString = response.text.trim()
      if (cleanJsonString.includes('```')) {
        cleanJsonString = cleanJsonString
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
      }

      parsedData = JSON.parse(cleanJsonString)
    } catch (error) {
      console.error(
        `❌ [Reviewer Parser, Worker ${jobId}] Error occurred while parsing JSON:`,
        error,
      )
      return {
        success: false,
        status: 500,
        message: 'Error occurred while parsing JSON',
      }
    }

    console.log(`\n✅ [Reviewer Parser, Worker ${jobId}] Parsing completed successfully.`)
    return {
      success: true,
      status: 200,
      message: 'Отзывы точки успешно спарсены',
      data: parsedData,
    }
  } catch (error) {
    console.error(
      `❌ [Reviewer Parser, Worker ${jobId}]Error occurred while parsing reviews:`,
      error,
    )
    return { success: false, status: 500, message: 'Ошибка при парсинге отзывов точки' }
  }
}
