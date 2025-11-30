import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

const ResumeCard = ({resume } : {resume: Resume}) => {
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
                        <h2 className="!text-black font-bold break-words text-xl">
                            {resume.companyName}
                        </h2>
                        <h3 className="text-lg break-words text-gray-500">
                            {resume.jobTitle}
                        </h3>
                    </div>
                    <div className="flex-shrink-0">
                        <ScoreCircle score={resume.feedback.overallScore} />
                    </div>
                </div>
                <div
                    className="relative w-full animate-in fade-in duration-1000ms rounded-lg overflow-hidden"
                    style={{
                        padding: '2px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                >
                    <div
                        className="w-full h-full bg-white rounded-md overflow-hidden"
                    >
                        <img
                            src={resume.imagePath}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top block"
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default ResumeCard