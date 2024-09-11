import "../css/index.css";
import SideBar from "../components/SideBar/sidebar";
const searchIcon  = "../assets/search.svg"

export default function Index() {

  return (
    <>
    <SideBar />
    <div className="main">
      <div className="searchbarwrapper flex-jc-ai  main-bg">
        <button className="submitButton">
          <img className="searchIcon" src={searchIcon} alt="search icon" />
        </button>
        <input className="searchBar" id="searchbar" type="text" placeholder="Search drive" />
      </div>
      <div className="mainWindow main-bg">
        
      </div>
    </div>
    </>
  );
}
