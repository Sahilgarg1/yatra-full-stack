import NavBar from "@/components/NavBar";
import CompareClient from "@/components/CompareClient";

export const metadata = {
  title: "Compare Trips — Yatra",
};

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const date = params?.date || "";
  const days = params?.days || "";

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <CompareClient initialQ={q} initialDate={date} initialDays={days} />
    </div>
  );
}
