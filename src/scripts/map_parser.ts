// Prisma
import { prisma } from '#lib/prisma'

// Google GenAI
import { GoogleGenAI } from '@google/genai'
import type { GenerateContentResponse } from '@google/genai'

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
})

export async function parseMap(mapUrlSearchQuery: string, companyId: number) {
  console.log(`[Map Parser] Starting parsing with query: ${mapUrlSearchQuery}`)

  // Bun Webview
  await using view = new Bun.WebView({ backend: 'chrome' })
  try {
    // Validate the search query
    if (typeof mapUrlSearchQuery !== 'string') {
      console.error('❌ [Map Parser] Invalid search query.')
      return { success: false, status: 400, message: 'Формат URL неправильный' }
    }

    // Navigate to Maps Website with the search query
    await view.navigate(mapUrlSearchQuery)
    await Bun.sleep(5000) // Wait for the page to load
    console.log(`[Map Parser] Page loaded, executing script to extract data...`)

    // Scroll the page to load all cards
    type ScrollResult =
      | {
          error: false
          currentScroll: number
          maxScroll: number
          done: boolean
        }
      | {
          error: true
          msg: string
        }

    // Step counter for logging
    let step = 1

    while (true) {
      let scrollResult: ScrollResult
      try {
        scrollResult = (await view.evaluate(`
          (() => {
            // Find the scroll container
            const container = document.querySelector('.scroll__container');
            
            if (!container) {
              return { error: true, msg: "Контейнер .scroll__container не найден!" };
            }
            
            const scrollBefore = container.scrollTop;
            
            // Scroll down by 400 pixels
            container.scrollTop += 400;
            
            const scrollAfter = container.scrollTop;
            const maxScrollPossible = container.scrollHeight - container.clientHeight;

            // Check if we've reached the bottom (allowing a small threshold of 5 pixels)
            const isBottomReached = (scrollBefore === scrollAfter) || (scrollAfter >= maxScrollPossible - 5);

            return {
              error: false,
              currentScroll: scrollAfter,
              maxScroll: maxScrollPossible,
              done: isBottomReached
            };
          })()
        `)) as ScrollResult
      } catch (evaluateError) {
        console.error(`❌ [Map Parser] Error during step ${step}:`, evaluateError)
        break
      }

      // Handle errors from the scroll evaluation
      if (scrollResult.error) {
        console.error(`❌ [Map Parser] Error inside page: ${scrollResult.msg}`)
        break
      }

      console.log(
        `[Step ${step}] Scroll position: ${scrollResult.currentScroll}px of ${scrollResult.maxScroll}px`,
      )

      // Check if we've reached the bottom of the list
      if (scrollResult.done) {
        console.log('🎉 [Map Parser] Success! We have scrolled to the bottom of the list.')
        break
      }

      console.log('⏳ [Map Parser] Waiting 5 seconds for new cards to load...')
      await Bun.sleep(5000)

      step++
    }

    console.log('=== [Map Parser] SCROLLING COMPLETED, ALL CARDS LOADED ===\n')

    // Extract the page content after scrolling
    const pageContent = await view.evaluate(`
      (() => {
        // Take the outer HTML of the list container that holds all the cards
        const listElement = document.querySelector('.search-list-view__list') 
                         || document.querySelector('.scroll__container');
                         
        return listElement ? listElement.outerHTML : null;
      })()
    `)

    const response: GenerateContentResponse = await googleGenAI.models.generateContent({
      model: 'gemini-3.5-flash',
      contents:
        `Hi! Can you parse this HTML and create JSON without additional text? There the fields which you must create: companyId(${companyId}), name(String), address(String), lat(Float), lng(Float), workHours(String), createdAt(DateTime, set to current time), deletedAt(DateTime, set null) and yandexId(String). Here is the HTML content: ` +
        pageContent,
    })

    if (!response.text) {
      throw new Error('🤖 [Map Parser] Error: Gemini returned an empty response or undefined!')
    }

    // Clean the response text to ensure it's valid JSON before parsing
    try {
      let cleanJsonString = response.text.trim()

      if (cleanJsonString.includes('```')) {
        cleanJsonString = cleanJsonString
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
      }

      const parsedData = JSON.parse(cleanJsonString)

      await prisma.companyPoint.createMany({
        data: parsedData,
        skipDuplicates: true,
      })
    } catch (error) {
      console.error('❌ [Map Parser] Error parsing JSON:', error)
    }

    // Close the WebView
    view.close()
    console.log('\n✅ [Map Parser] WebView closed, parsing completed successfully.')
    return { success: true, status: 201, message: 'Точки заведения успешно импортированы' }
  } catch (error) {
    console.error('❌ [Map Parser] Error parsing map:', error)
    return { success: true, status: 500, message: 'Ошибка при импортирований точек заведения' }
  }
}
