// Google GenAI
import { GoogleGenAI } from '@google/genai'
import type { GenerateContentResponse } from '@google/genai'

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
})

export async function parseMap(mapUrlSearchQuery: string, companyId: number, jobId: number) {
  console.log(`[Map Parser of Worker(Points) ${jobId}] Starting parsing`)
  // Bun Webview for virtual browser
  await using view = new Bun.WebView({ backend: 'chrome' })
  try {
    // Validate the search query
    if (typeof mapUrlSearchQuery !== 'string') {
      console.error(`❌ [Map Parser of Worker(Points) ${jobId}] Invalid search query.`)
      return { success: false, status: 400, message: 'Формат URL неправильный' }
    }

    // Navigate to Yandex maps Website with the search query
    await view.navigate(mapUrlSearchQuery)
    await Bun.sleep(5000) // Wait for the page to load

    // Scroll function (we must to load all cards)

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
          `❌ [Map Parser of Worker(Points) ${jobId}] Error of scrolling function:`,
          evaluateError,
        )
        break
      }

      // If container disappear
      if (scrollResult.status === 404) {
        console.error(`❌ Error inside page: ${scrollResult.message}`)
        break
      }

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

    const response: GenerateContentResponse = await googleGenAI.models.generateContent({
      model: 'gemini-3.5-flash',
      contents:
        `Hi! Can you parse this HTML and create JSON without additional text? There the fields which you must create: companyId(${companyId}), name(String), address(String), lat(Float), lng(Float), workHours(String), createdAt(DateTime, set current time), deletedAt(DateTime, set null) and yandexId(String). Please make it always Array of cards. Here is the HTML content: ` +
        pageContent,
    })

    if (!response.text) {
      return {
        success: false,
        status: 400,
        message: `❌ [Map Parser of Worker(Points) ${jobId}] Error: Gemini returned an empty response or undefined!`,
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
      console.error(`❌ [Map Parser of Worker(Points) ${jobId}] Error parsing JSON:`, error)
    }

    // Close the WebView
    view.close()
    console.log(`\n✅ [Map Parser of Worker(Points) ${jobId}] Parsing completed successfully.`)
    return {
      success: true,
      status: 201,
      message: 'Точки заведения успешно спарсены',
      data: parsedData,
    }
  } catch (error) {
    console.error(`❌ [Map Parser of Worker(Points) ${jobId}]Error parsing map:`, error)
    return { success: false, status: 500, message: 'Ошибка при парсинге точек заведения' }
  }
}

export async function parseReviews(yandexId: string, pointId: number, jobId: number) {
  console.log(`[Review Parser of Worker(Reviews) ${jobId}] Starting parsing`)
  // Bun Webview for virtual browser
  await using view = new Bun.WebView({ backend: 'chrome' })
  try {
    // Validate the search query

    // Navigate to Yandex maps Website with the search query
    await view.navigate(`https://yandex.uz/maps/org/adiba/${yandexId}/reviews/`)
    await Bun.sleep(5000) // Wait for the page to load

    // Set Sort from new to old
    interface SortResult {
      success: false
      status: number
      message: string
    }

    const resultOfSort: SortResult = await view.evaluate(`
  (async () => {
    const sortButton = document.querySelector('.rating-ranking-view');
    if (!sortButton) {
      return { success: false, status: 404, message: "Не удалось найти кнопку сортировки" };
    }
    sortButton.click();

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Используем одинарные кавычки 'По новизне' внутри двойных
    const options = document.querySelectorAll('.rating-ranking-view__popup-line');
    const newSortOption = options[1];
    if (!newSortOption) {
      return { success: false, status: 404, message: "Не удалось найти кнопку 'По новизне'" };
    }
    newSortOption.click();

    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, status: 200, message: "Сортировка изменена" };
  })()
`)
    if (resultOfSort.status === 404) {
      return {
        success: resultOfSort.success,
        status: resultOfSort.status,
        message: resultOfSort.message,
      }
    }

    // Scroll function (we must to load all cards)

    // Interface for results
    interface ScrollResult {
      isBottomReached?: boolean
      status: number
      message: string
    }

    let step = 0

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
          `❌ [Map Parser of Worker(Reviews) ${jobId}] Error of scrolling function:`,
          evaluateError,
        )
        break
      }

      // If container disappear
      if (scrollResult.status === 404) {
        console.error(`❌ Error inside page: ${scrollResult.message}`)
        break
      }

      if (step === 1) {
        console.log(`1213Scrolling function completed: ${scrollResult.message}`)
        break
      }

      if (scrollResult.isBottomReached) {
        console.log(`Scrolling function completed: ${scrollResult.message}`)
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
        `Hi! Can you parse this HTML and create JSON without additional text? There the fields which you must create: companyPointId(${pointId}), usernameOfReviewer(String), text(String), rating(Int from 1 to 5), createdAt(Date), aiAnswer(just empty String). Please make it always Array of reviews. Here is the HTML content: ` +
        pageContent,
    })

    if (!response.text) {
      return {
        success: false,
        status: 400,
        message: `❌ [Map Parser of Worker(Reviews) ${jobId}] Error: Gemini returned an empty response or undefined!`,
      }
    }
    console.log('test4')

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
      console.error(`❌ [Map Parser of Worker(Points) ${jobId}] Error parsing JSON:`, error)
    }

    console.log(`\n✅ [Map Parser of Worker(Points) ${jobId}] Parsing completed successfully.`)
    return {
      success: true,
      status: 201,
      message: 'Отзывы точки успешно спарсены',
      data: parsedData,
    }
  } catch (error) {
    console.error(`❌ [Map Parser of Worker(Points) ${jobId}]Error parsing map:`, error)
    return { success: false, status: 500, message: 'Ошибка при парсинге отзывов точек' }
  }
}
