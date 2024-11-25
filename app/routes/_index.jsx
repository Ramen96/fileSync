import { data } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import "../css/index.css";
import SideBar from "./components/SideBar/sidebar.jsx";
import DisplayDirectory from "./components/DisplayDirectory/displayDirectory.jsx";
import { prisma } from "../utils/prisma.server.js";

const searchIcon = "../assets/search.svg";

export async function loader() {
  const files = await prisma.file_data.findMany();
  return data(files);
}

export default function Index() {
  const files = useLoaderData();

  return (
    <>
      <SideBar />
      <div className="main">
        <div className="searchbarwrapper flex-jc-ai  main-bg">
          <button className="submitButton">
            <img className="searchIcon" src={searchIcon} alt="search icon" />
          </button>
          <input
            className="searchBar"
            id="searchbar"
            type="text"
            placeholder="Search drive"
          />
        </div>
        <div className="mainWindow main-bg">
          <DisplayDirectory files={files} />
        </div>
      </div>
    </>
  );
}
