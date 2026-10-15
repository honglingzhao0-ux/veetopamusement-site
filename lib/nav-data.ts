/**
 * 站点导航用类目树（仅服务端 / 构建期使用）。
 * 品类顺序取自 data/categories.json。
 *
 * 导航只展示类目本身：Header 下拉、移动端 Products 折叠项与 Footer 产品栏
 * 均不再列出具体产品名，因此这里不携带产品数据。产品链接只出现在页面内容区
 * （首页旗舰卡片、品类页列表、相关产品）。
 */
import { getCategories } from "@/lib/products";

export interface NavCategoryNode {
  slug: string;
  name: string;
}

export function getCategoryNav(): NavCategoryNode[] {
  return getCategories().map((cat) => ({
    slug: cat.slug,
    name: cat.name,
  }));
}
