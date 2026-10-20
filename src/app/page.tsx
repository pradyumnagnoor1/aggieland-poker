import Script from "next/script";
import Marketing from "@/components/marketing";
import "./marketing.css";
export default function Home() {
  return (
    <>
      <Marketing />
      <Script src="/assets/marketing.js" strategy="afterInteractive" />
    </>
  );
}
