import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    view: 'rss',
    name: 'Changelog',
    maintainers: ['DIYgod'],
    handler,
    example: '/cursor/changelog',
    path: '/changelog',
    categories: ['program-update'],
    radar: {
        source: ['changelog.cursor.sh/'],
        target: '/changelog',
    },
};

async function handler() {
    const baseUrl = 'https://changelog.cursor.sh';
    const response = await got(baseUrl);
    const $ = load(response.data);

    // 获取所有更新条目
    const items = $('h2')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.text().trim();

            // 获取日期
            const dateText = $item.next().text().trim();
            const pubDate = parseDate(dateText);

            // 获取更新内容
            let description = '';
            let currentNode = $item.next().next();
            while (currentNode.length && !currentNode.is('h2')) {
                description += currentNode.html() || '';
                currentNode = currentNode.next();
            }

            return {
                title,
                description,
                pubDate,
                link: `${baseUrl}#${title.toLowerCase().replaceAll(/\s+/g, '-')}`,
            };
        })
        // 按发布日期降序排序
        .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    return {
        title: 'Cursor Changelog',
        link: baseUrl,
        description: 'Cursor Editor Changelog',
        item: items,
    };
}
