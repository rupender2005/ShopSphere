import { useState } from "react";

const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);

  const nextPage = () => setPage((currentPage) => currentPage + 1);
  const previousPage = () =>
    setPage((currentPage) => Math.max(1, currentPage - 1));
  const goToPage = (nextPageNumber) => setPage(Math.max(1, nextPageNumber));

  return {
    page,
    nextPage,
    previousPage,
    goToPage,
  };
};

export default usePagination;
