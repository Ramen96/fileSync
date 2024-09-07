import "../css/index.css";
import folderIcon from "../../public/folder.svg";

export default function Index() {
  return (
    <div className="main">
      <div className="sidebar">
        <section className="logo">
          <img className="folderIcon" src={folderIcon} alt="folder icon"></img>
          <h1>FileSync</h1>
        </section>
        <section className="nbWrapper">
          <button className="newButton">
            <svg
              className="plusButtonSvg"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              role="img"
              width="64px"
              height="64px"
              viewBox="0 0 64 64"
              enable-background="new 0 0 64 64"
              xml:space="preserve"
            >
              <g>
                <line
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="2"
                  stroke-miterlimit="10"
                  x1="32"
                  y1="50"
                  x2="32"
                  y2="14"
                  id="id_101"
                ></line>
                <line
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="2"
                  stroke-miterlimit="10"
                  x1="14"
                  y1="32"
                  x2="50"
                  y2="32"
                  id="id_102"
                ></line>
              </g>
            </svg>
            New
          </button>
        </section>
      </div>
    </div>
  );
}
