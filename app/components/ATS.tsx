interface ATSProps {
    score: number;
    suggestions: {
        type: "good" | "improve";
        tip: string;
    }[];
}

const ATS = ({ score, suggestions }: ATSProps) => {
    // Determine colors and icon based on score
    const getScoreConfig = () => {
        if (score > 69) {
            return {
                bgGradient: "from-green-100 to-green-50",
                icon: "/icons/ats-good.svg",
                textColor: "text-green-700",
                subtitle: "Excellent ATS Compatibility!",
                description: "Your resume is well-optimized for Applicant Tracking Systems. It should pass through most ATS filters successfully."
            };
        } else if (score > 49) {
            return {
                bgGradient: "from-yellow-100 to-yellow-50",
                icon: "/icons/ats-warning.svg",
                textColor: "text-yellow-700",
                subtitle: "Good ATS Compatibility",
                description: "Your resume has decent ATS compatibility, but there's room for improvement to increase your chances of passing automated screenings."
            };
        } else {
            return {
                bgGradient: "from-red-100 to-red-50",
                icon: "/icons/ats-bad.svg",
                textColor: "text-red-700",
                subtitle: "ATS Compatibility Needs Improvement",
                description: "Your resume may struggle with Applicant Tracking Systems. Consider implementing the suggestions below to improve your chances."
            };
        }
    };

    const config = getScoreConfig();

    return (
        <div className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl shadow-md p-6 w-full`}>
            {/* Top Section */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm">
                    <img
                        src={config.icon}
                        alt="ATS Status"
                        className="w-10 h-10"
                        onError={(e) => {
                            // Fallback if image doesn't exist
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
                <div>
                    <h3 className={`text-2xl font-bold ${config.textColor}`}>
                        ATS Score - {score}/100
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Applicant Tracking System Compatibility
                    </p>
                </div>
            </div>

            {/* Description Section */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {config.subtitle}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {config.description}
                </p>
            </div>

            {/* Suggestions List */}
            {suggestions && suggestions.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-base font-semibold text-gray-800 mb-3">
                        Key Recommendations:
                    </h4>
                    <ul className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0">
                                    <img
                                        src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                                        alt={suggestion.type === "good" ? "Good" : "Improve"}
                                        className="w-5 h-5"
                                        onError={(e) => {
                                            // Fallback to colored circle if icon doesn't exist
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<div class="w-5 h-5 rounded-full ${
                                                    suggestion.type === "good"
                                                        ? "bg-green-500"
                                                        : "bg-yellow-500"
                                                }"></div>`;
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-gray-700 flex-1">
                                    {suggestion.tip}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Closing Encouragement */}
            <div className="pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600 text-center italic">
                    {score > 69
                        ? "Keep up the great work! Your resume is ATS-ready."
                        : score > 49
                            ? "Implement these suggestions to boost your ATS score and increase your chances!"
                            : "Don't worry! Following these recommendations will significantly improve your resume's ATS compatibility."}
                </p>
            </div>
        </div>
    );
};

export default ATS;