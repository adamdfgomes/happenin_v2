import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditableButton from "../components/TwoTruthsOneLie/EditableButton";
import Header from "../components/Header";
import { useGameSession } from '../context/GameSessionContext'
import Background from '../components/Background';

export function TwoTruthsOneLie() {
  const navigate = useNavigate();

  const initialLabels = [
    "Enter a truth",
    "Enter a lie",
    "Enter a truth",
  ];

  const [labels, setLabels] = useState([...initialLabels]);

  const handleLabelChange = (index: number, value: string) => {
    setLabels((prev) => {
      const next = [...prev];
      next[index] = value.trim() || initialLabels[index];
      return next;
    });
  };

  const allEdited = labels.every(
    (lab, i) => lab !== initialLabels[i] && lab.trim().length > 0
  );

  const handleSubmit = () => {
    console.log("Submitted:", labels);
    navigate(`/two-truths-one-lie/${sessionId}`) // 
  };

  return (
    <Background>
      <Header
        title="Two Truths One Lie"
        subtitle="No one's believing it's more than 4 inches mate"
      />
      {labels.map((lab, idx) => (
        <EditableButton
          key={idx}
          variant={idx === 1 ? "lie" : "truth"}
          initialLabel={initialLabels[idx]}
          onLabelChange={(val) => handleLabelChange(idx, val)}
        />
      ))}
      {allEdited && (
        <button
          className="mt-4 py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          onClick={handleSubmit}
        >
          Submit
        </button>
      )}
    </Background>
  );
}

export default TwoTruthsOneLie;