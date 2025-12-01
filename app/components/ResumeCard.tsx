import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({resume } : {resume: Resume}) => {
    const { fs } = usePuterStore();
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImage = async() => {
            try {
                setLoading(true);
                console.log("Loading image for resume:", resume.id, "from path:", resume.imagePath);

                const blob = await fs.read(resume.imagePath);

                if(!blob) {
                    console.error("Failed to load image blob");
                    setLoading(false);
                    return;
                }

                const url = URL.createObjectURL(blob);
                console.log("Image URL created:", url);
                setImageUrl(url);
            } catch (error) {
                console.error("Error loading image:", error);
            } finally {
                setLoading(false);
            }
        };

        if (resume.imagePath) {
            loadImage();
        }

        // Cleanup
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [resume.imagePath, fs]);

    return (
        <Link
            to={`/resume/${resume.id}`}
            className="block w-full h-fit animate-in fade-in duration-1000ms"
            style={{
                textDecoration: 'none'
            }}
        >
            <div
                className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                    width: '100%',
                    height: 'fit-content'
                }}
            >
                <div className="flex justify-between items-start gap-4 w-full">
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        {resume.companyName && (
                            <h2 className="!text-black font-bold break-words text-xl">
                                {resume.companyName}
                            </h2>
                        )}
                        {resume.jobTitle && (
                            <h3 className="text-lg break-words text-gray-500">
                                {resume.jobTitle}
                            </h3>
                        )}
                        {!resume.companyName && !resume.jobTitle && (
                            <h2 className="!text-black font-bold">Resume</h2>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        <ScoreCircle score={resume.feedback?.overallScore || 0} />
                    </div>
                </div>

                <div
                    className="relative w-full animate-in fade-in duration-1000ms rounded-lg overflow-hidden"
                    style={{
                        padding: '2px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                >
                    <div className="w-full h-full bg-white rounded-md overflow-hidden">
                        {loading ? (
                            <div className="w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        ) : imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Resume preview"
                                className="w-full h-[350px] max-sm:h-[200px] object-cover object-top block"
                            />
                        ) : (
                            <div className="w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100">
                                <p className="text-gray-500">Image not available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ResumeCard;