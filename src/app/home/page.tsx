import Image from "next/image";
import styles from "./page.module.css";
import Banner from "@/components/Banner";
import Card from "../(campgroundinfo)/campgrounds/page";

export default function Home() {
  return (
    <main>
      <Banner/>
      <Card></Card>
    </main>
  );
}
