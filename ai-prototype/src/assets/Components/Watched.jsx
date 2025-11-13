import React from "react";
import YouTube from "react-youtube";
import { Sidebar } from "./Sidbar";
import "./Watched.css";

export function Watched() {
  const opts = {
    height: "315",
    width: "100%", // make responsive
    playerVars: {
      autoplay: 0, // set 1 if you want autoplay
    },
  };

  return (
    <>
      <Sidebar />
      <div className="watched-page">
        <h1 className="watched-title">Recorded Classes</h1>

        <div className="watchMain cols-two">
          <div className="watchchild">
            <YouTube videoId="3JdMUhffS_Q" opts={opts} />
          </div>

          <div className="watchchild">
            <YouTube videoId="3JdMUhffS_Q" opts={opts} />
          </div>
        </div>

         <div className="watchMain cols-two">
          <div className="watchchild">
            <YouTube videoId="3JdMUhffS_Q" opts={opts} />
          </div>

          <div className="watchchild">
            <YouTube videoId="3JdMUhffS_Q" opts={opts} />
          </div>
        </div>

         <div className="watchMain cols-two">
          <div className="watchchild">
            <YouTube videoId="3JdMUhffS_Q" opts={opts} />
          </div>

          <div className="watchchild">
            <YouTube videoId="3JdMUhffS_Q" opts={opts} />
          </div>
        </div>
        
      </div>
    </>
  );
}
