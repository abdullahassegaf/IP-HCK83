import { useNavigate } from "react-router";

export default function Card({ title, summary, imageUrl, id }) {
   const navigate = useNavigate();
   return (
      <div
         className="card shadow-sm mb-4 d-flex flex-column justify-content-between"
         style={{
            maxWidth: 320,
            minHeight: 430,
            margin: "16px auto",
            borderRadius: 16,
         }}
      >
         <img
            src={imageUrl}
            alt={title}
            className="card-img-top"
            style={{
               height: 200,
               objectFit: "cover",
               borderTopLeftRadius: 16,
               borderTopRightRadius: 16,
            }}
         />
         <div className="card-body d-flex flex-column flex-grow-1">
            <h5 className="card-title mb-2" style={{ fontWeight: 600 }}>
               {title.split(" ").slice(0, 5).join(" ")}
               {title.split(" ").length > 5 ? "..." : ""}
            </h5>
            <p
               className="card-text text-secondary"
               style={{
                  fontSize: "1rem",
                  lineHeight: 1.5,
                  height: "4.5rem",
                  overflow: "hidden",
               }}
            >
               {summary.split(" ").slice(0, 10).join(" ")}
               {summary.split(" ").length > 10 ? "..." : ""}
            </p>
            <button
               className="btn btn-primary mt-auto w-100 align-self-end"
               onClick={() => navigate(`/detail/${id}`)}
            >
               Detail
            </button>
         </div>
      </div>
   );
}
