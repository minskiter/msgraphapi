import { defineConfig } from "vitepress"

export default defineConfig({
    title: "Microsoft Graph API",
    description: "Microsoft Graph API Vue3 DEMO",
    lang: "en-US",
    themeConfig: {
        siteTitle: 'Microsoft Graph',
        footer: {
            message: "MIT Licensed",
            copyright: "Copyright © Creator SN - 2022"
        },
        nav: [
            {
                text: "Home",
                link: "/"
            },
            {
                text: "Guide",
                link: "/guide/",
            }
        ],
        sidebar: [
            {
                text: 'Guide',
                collapsed: true,
                items: [
                    
                ],
            }
        ]
    },
    markdown: {
        lineNumbers: true,
        toc: {
            level: [1, 2, 3]
        }
    }
})