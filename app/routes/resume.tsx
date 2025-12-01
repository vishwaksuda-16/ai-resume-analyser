import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    {title: 'Resumind | Review'},
    {name: 'description', content: 'Detailed overview of your resume'},
])

const Resume = () => {
    const {auth, isLoading, fs, kv} = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect( () => {
        if(!isLoading && !auth.isAuthenticated)
            navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, auth.isAuthenticated]);

    useEffect(() => {
        const loadResume = async () => {
            try {
                console.log("Loading resume with id:", id);

                // Fix: Use colon instead of slash to match the key used in upload
                const resume = await kv.get(`resume:${id}`);
                console.log("Resume data from KV:", resume);

                if(!resume) {
                    console.error("No resume found for id:", id);
                    setError('Resume not found');
                    return;
                }

                const data = JSON.parse(resume);
                console.log("Parsed resume data:", data);

                // Load PDF
                console.log("Loading PDF from path:", data.resumePath);
                const resumeBlob = await fs.read(data.resumePath);

                if(!resumeBlob) {
                    console.error("Failed to read resume file");
                    setError('Failed to load resume file');
                    return;
                }

                const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                const resumeUrl = URL.createObjectURL(pdfBlob);
                console.log("Resume URL created:", resumeUrl);
                setResumeUrl(resumeUrl);

                // Load Image
                console.log("Loading image from path:", data.imagePath);
                const imageBlob = await fs.read(data.imagePath);

                if(!imageBlob) {
                    console.error("Failed to read image file");
                    setError('Failed to load image file');
                    return;
                }

                const imageUrl = URL.createObjectURL(imageBlob);
                console.log("Image URL created:", imageUrl);
                setImageUrl(imageUrl);

                console.log("Feedback data:", data.feedback);
                console.log("Feedback structure:", JSON.stringify(data.feedback, null, 2));
                setFeedback(data.feedback);

            } catch (err) {
                console.error("Error loading resume:", err);
                setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }

        if (id) {
            loadResume();
        }
    }, [id, kv, fs])

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
            if (resumeUrl) URL.revokeObjectURL(resumeUrl);
        };
    }, [imageUrl, resumeUrl]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to HomePage</span>
                </Link>
            </nav>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
                    {error}
                </div>
            )}

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl ? (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    alt="Resume preview"
                                    className="w-full h-full object-contain rounded-xl"
                                />
                            </a>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading resume...</p>
                            </div>
                        </div>
                    )}
                </section>

                <section className="feedback-section">
                    <h2 className="text-4xl text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            {feedback.ATS && (
                                <ATS
                                    score={feedback.ATS.score || 0}
                                    suggestions={feedback.ATS.tips || []}
                                />
                            )}
                            <Details feedback={feedback}/>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <img src="/images/resume-scan-2.gif" alt="Loading" className="w-full max-w-md" />
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default Resume;