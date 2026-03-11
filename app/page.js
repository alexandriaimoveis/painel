import Counter from "./components/counter";
// import Sidebar from "./components/sidebar/page";
// import Main from "./components/main/page";

export default function Home() {
  return (
    <>
      {/* <div className="flex">
        <div className="flex-1/12">
          <Sidebar />
        </div>

        <div className="flex-10/12">
          <Main />
        </div>
      </div> */}

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            Nosso site está quase no ar!
          </h1>
          <p className="text-lg md:text-xl">Faltam apenas</p>

          <Counter />

          <p className="text-sm md:text-base">
            Fique ligado! Estamos preparando algo incrível.
          </p>
        </div>
      </div>
    </>
  );
}
