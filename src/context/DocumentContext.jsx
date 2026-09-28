import { createContext, useState } from "react";

export const DocumentContext = createContext();

export function DocumentProvider({ children }) {

  const [documents, setDocuments] = useState([]);

  const addDocument = (doc) => {
    setDocuments([...documents, doc]);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        addDocument
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

