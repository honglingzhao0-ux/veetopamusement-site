import { getCategoryNav } from "@/lib/nav-data";
import SiteHeader from "@/components/site-header";

/** 服务端壳：读取目录树并注入客户端导航（避免 fs 进 client bundle） */
export default function Header() {
  const categories = getCategoryNav(3);
  return <SiteHeader categories={categories} />;
}
