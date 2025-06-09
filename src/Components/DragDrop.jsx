import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const items = [
  { id: 1, name: "🍎 Apple" },
  { id: 2, name: "🍌 Banana" },
  { id: 3, name: "🍊 Orange" },
  { id: 4, name: "🍇 Grape" },
  { id: 5, name: "🍉 Watermelon" },
];

const DragDrop = () => {
     const [leftList, setLeftList] = useState(items);
  const [rightList, setRightList] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(""); // "left" or "right"
  const [searchTerm, setSearchTerm] = useState("");

  const handleDragStart = (item, source) => {
    setDraggedItem(item);
    setDragSource(source);
  };

  const allowDrop = (e) => e.preventDefault();

  const handleDropLeft = (e) => {
    e.preventDefault();
    if (!draggedItem || dragSource !== "right") return;
    const isDuplicate = leftList.some((i) => i.id === draggedItem.id);
    if (isDuplicate) return;
    setLeftList((prev) => [...prev, draggedItem]);
    setRightList((prev) => prev.filter((i) => i.id !== draggedItem.id));
    setDraggedItem(null);
    setDragSource("");
  };

  const handleDropRight = (e) => {
    e.preventDefault();
    if (!draggedItem || dragSource !== "left") return;
    const isDuplicate = rightList.some((i) => i.id === draggedItem.id);
    if (isDuplicate) return;
    setRightList((prev) => [...prev, draggedItem]);
    setLeftList((prev) => prev.filter((i) => i.id !== draggedItem.id));
    setDraggedItem(null);
    setDragSource("");
  };

  const handleClearAll = () => {
    setLeftList(items);
    setRightList([]);
    setSearchTerm("");
  };

  const handleSaveToExcel = () => {
    if (rightList.length === 0) {
      alert("Nothing to save.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rightList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Saved Items");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "saved_items.xlsx");
  };

  const filteredLeft = leftList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
   <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>🖱️ Drag & Drop with Save to Excel</h2>

      <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>
        {/* Left List */}
        <div
          onDrop={handleDropLeft}
          onDragOver={allowDrop}
          style={{ width: "45%" }}
        >
          <h3>Available Items</h3>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <ul style={{ listStyle: "none", padding: 0 }}>
            <AnimatePresence>
              {filteredLeft.map((item) => (
                <motion.li
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item, "left")}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    padding: "10px",
                    marginBottom: "10px",
                    background: "#f0f0f0",
                    cursor: "grab",
                    borderRadius: "6px",
                  }}
                >
                  {item.name}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {filteredLeft.length === 0 && <p>No results found.</p>}
        </div>

        {/* Right List */}
        <div
          onDrop={handleDropRight}
          onDragOver={allowDrop}
          style={{
            width: "45%",
            minHeight: "200px",
            border: "2px dashed #aaa",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3>Dropped Items</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <AnimatePresence>
              {rightList.map((item) => (
                <motion.li
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item, "right")}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    padding: "10px",
                    marginBottom: "10px",
                    background: "#dff0d8",
                    cursor: "grab",
                    borderRadius: "6px",
                  }}
                >
                  {item.name}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {rightList.length === 0 && <p>Drag items here →</p>}
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "30px",
          gap: "20px",
        }}
      >
        <button
          onClick={handleClearAll}
          style={{
            padding: "10px 20px",
            background: "#ff4d4f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🗑️ Clear All
        </button>

        <button
          onClick={handleSaveToExcel}
          style={{
            padding: "10px 20px",
            background: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          💾 Save to Excel
        </button>
      </div>
    </div>
  )
}

export default DragDrop