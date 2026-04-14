let cachedDocs: string | null = null
let cacheTime = 0
const CACHE_TTL = 3600 * 1000

export async function getNotionDocs(): Promise<string> {
  if (cachedDocs && Date.now() - cacheTime < CACHE_TTL) {
    return cachedDocs
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_DB_ID = process.env.NOTION_DB_ID

  if (!NOTION_API_KEY || !NOTION_DB_ID) {
    return ""
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    )

    if (!res.ok) {
      console.error("Notion DB query failed:", res.status)
      return ""
    }

    const data = await res.json()
    const docs: string[] = []

    for (const page of data.results) {
      const props = page.properties
      const titleProp = props["이름"] || props["Name"]
      if (!titleProp?.title?.[0]) continue
      const title = titleProp.title[0].plain_text

      const categoryProp = props["카테고리"]
      const category = categoryProp?.select?.name || ""

      const blocksRes = await fetch(
        `https://api.notion.com/v1/blocks/${page.id}/children`,
        {
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28",
          },
        }
      )

      if (!blocksRes.ok) continue

      const blocksData = await blocksRes.json()
      const contents: string[] = []

      for (const block of blocksData.results) {
        const type = block.type
        const supported = [
          "paragraph",
          "heading_1",
          "heading_2",
          "heading_3",
          "bulleted_list_item",
          "numbered_list_item",
        ]

        if (supported.includes(type)) {
          const richText = block[type]?.rich_text || []
          if (richText.length > 0) {
            const text = richText.map((r: any) => r.plain_text).join("")
            contents.push(text)
          }
        }
      }

      if (contents.length > 0) {
        const label = category ? `[${category}] ` : ""
        docs.push(`## ${label}${title}\n${contents.join("\n")}`)
      }
    }

    cachedDocs = docs.join("\n\n---\n\n")
    cacheTime = Date.now()
    return cachedDocs
  } catch (err) {
    console.error("Notion fetch error:", err)
    return ""
  }
}
