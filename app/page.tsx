/*  Questions you can ask:
    - What is the price of AVA Blend?
    - Who is Salem Proctor?
    - what did the espn article say about taylor jenkins?
    - how long did tiktok go offline in the us?
    - what did Trump announce on friday?
    - what does this article say about declarative memory?
    - what does the article say about how to optimize the retrieval speed?
    - did article say who is leading the tiktok dealmaking effort?
    - did article say how many american users tikok has?
*/
import SearchContainer from "@/app/components/SearchContainer";

export default function Home() {
  return (
    <main className="p-4 w-full h-full">
      <div className="flex flex-col gap-1">
        <SearchContainer />
      </div>
    </main>
  );
}
