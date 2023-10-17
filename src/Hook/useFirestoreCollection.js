import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../utils/Firebase";

const useFirestoreCollection = (collectionName, orderField) => {
  const [data, setData] = useState([]);
  const [loader, loaderF] = useState(true);

  useEffect(() => {
    // Create a query that orders the documents in descending order
    const q = query(
      collection(db, collectionName),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dataList = [];
        snapshot.docs.forEach((doc) => {
          dataList.push({ id: doc.id, ...doc.data() });
        });
        setData(dataList);
        loaderF(false);
      },
      (error) => {
        console.log(error);
        loaderF(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName, orderField]);

  return { data, loader };
};

export default useFirestoreCollection;
