/*  Possible Questions to-ask:
    - what does this article say about declarative memory?
    - what did the espn article say about taylor jenkins?
    - what does the article say about how to optimize the retrieval speed?
    - what did Trump announce on friday?
    - did article say who is leading the tiktok dealmaking effort?
    - did article say how many american users tikok has?
    - how long did tiktok go offline in the us?
*/
import SearchContainer from "../components/SearchContainer";

export default function Home() {
  return (
    <main className="p-4 w-full h-full">
      <div className="flex flex-col gap-1">
        <SearchContainer />
      </div>
    </main>
  );
}
