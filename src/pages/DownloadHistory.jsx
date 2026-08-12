import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../services/firebase";

function DownloadHistory() {
    const [downloads, setDownloads] = useState([]);
    useEffect(() => {
        fetchDownloads();
    }, []);
    const fetchDownloads = async () => {
  const querySnapshot = await getDocs(
    collection(db, "downloads")
  );

  const data = querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(
      item =>
        item.userEmail === auth.currentUser?.email
    );

  setDownloads(data);
};
  return (
    <div>
      <h1>📥 Download History</h1>

      {downloads.length === 0 ? (
  <p>No Download History</p>
) : (
  downloads.map((item) => (
    <div key={item.id}>
      <h3>{item.resumeName}</h3>
      <p>
        {item.downloadedAt?.toDate
          ? item.downloadedAt
              .toDate()
              .toLocaleString()
          : "Date not available"}
      </p>
    </div>
  ))
)}
    </div>
  );
}

export default DownloadHistory;