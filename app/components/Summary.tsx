import { useEffect, useRef, useState } from "react";
import ScoreBadge from "~/components/ScoreBadge";
import ScoreGauge from "~/components/ScoreGauge";

const Category = ({title, score}: {title: string; score: number}) => {
    const textColor = score > 70 ? "text-green-600"
        : score > 49 ? "text-yellow-600" : 'text-red-600';

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-between w-full">
                    <p className="flex flex-row text-lg font-medium">{title} <ScoreBadge score={score} /></p>
                    <p className={`text-xl font-bold ${textColor}`}>
                        {score}/100
                    </p>
                </div>
            </div>
        </div>
    )
}

const Summary = ({feedback}:{feedback: Feedback}) => {
    // Safety checks with default values
    const overallScore = feedback?.overallScore ?? 0;
    const toneScore = feedback?.toneAndStyle?.score ?? 0;
    const contentScore = feedback?.content?.score ?? 0;
    const structureScore = feedback?.structure?.score ?? 0;
    const skillsScore = feedback?.skills?.score ?? 0;

    // Debug log to see the feedback structure
    useEffect(() => {
        console.log("Summary feedback data:", feedback);
    }, [feedback]);

    return (
        <div className="bg-white rounded-2xl shadow-md w-full">
            <div className="flex flex-row items-center p-4 gap-8 max-sm:flex-col">
                <ScoreGauge score={overallScore}/>

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Your Resume Score</h2>
                    <p className="text-sm text-gray-500">
                        This score is calculated based on the variables listed below
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-200">
                <Category title="Tone & Style" score={toneScore} />
                <Category title="Content" score={contentScore} />
                <Category title="Structure" score={structureScore} />
                <Category title="Skills" score={skillsScore} />
            </div>
        </div>
    )
}

export default Summary;