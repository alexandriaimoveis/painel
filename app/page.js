import Sidebar from "./components/sidebar/page";
import Main from "./components/main/page";

export default function Home() {
  return (
    <>
      <div className="flex">
        <div className="flex-1/12">
          <Sidebar />
        </div>

        <div className="flex-10/12">
          <Main />
        </div>
      </div>
    </>
  );
}
