import { useState, useMemo, useEffect } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  itemsPerPage?: number; // 👈 Sigue siendo opcional
}

export function usePagination<T>({ 
  data, 
  searchFields, 
  itemsPerPage = 5 // 🚀 ¡LA CLAVE ESTÁ AQUÍ! Cambia este número al valor global que desees (ej: 5)
}: UsePaginationProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // El resto de tu código del hook se queda EXACTAMENTE IGUAL...
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter((item) =>
      searchFields.some((field) => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm, searchFields]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, indexOfFirstItem, indexOfLastItem]);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
    nextPage,
    prevPage,
  };
}
