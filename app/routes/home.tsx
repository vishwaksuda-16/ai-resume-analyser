import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resume Analyser" },
        { name: "description", content: "Smart Resume AI for your dream job!" },
    ];
}

export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(true);

    useEffect(() => {
        if(!auth.isAuthenticated) {
            navigate('/auth?next=/');
        }
    }, [auth.isAuthenticated, navigate]);

    useEffect(() => {
        const loadResumes = async () => {
            try {
                setLoadingResumes(true);
                console.log("Loading resumes...");

                const resumeList = await kv.list('resume:*', true) as KVItem[];
                console.log("Resume list from KV:", resumeList);

                if (!resumeList || resumeList.length === 0) {
                    console.log("No resumes found");
                    setResumes([]);
                    setLoadingResumes(false);
                    return;
                }

                const parsedResumes = resumeList.map((item) => {
                    console.log("Parsing resume:", item.key);
                    return JSON.parse(item.value) as Resume;
                });

                console.log("Parsed resumes:", parsedResumes);
                setResumes(parsedResumes);
            } catch (error) {
                console.error("Error loading resumes:", error);
                setResumes([]);
            } finally {
                setLoadingResumes(false);
            }
        };

        if (auth.isAuthenticated) {
            loadResumes();
        }
    }, [auth.isAuthenticated, kv]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            <section className="main-section max-w-6xl mx-auto px-4 md:px-8">
                <div className="page-heading py-16">
                    <h1>Track your Applications & Resume Ratings</h1>
                    {!loadingResumes && resumes.length === 0 ? (
                        <h2>No resumes found. Upload your first resume to get feedback</h2>
                    ) : (
                        <h2>Review your submissions and check AI-powered feedback.</h2>
                    )}
                </div>

                {loadingResumes && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <img
                            src="/images/resume-scan-2.gif"
                            alt="Loading"
                            className="w-[200px]"
                        />
                        <p className="text-gray-600 mt-4">Loading your resumes...</p>
                    </div>
                )}

                {!loadingResumes && resumes.length > 0 && (
                    <div className="resumes-section grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pb-16">
                        {resumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume}/>
                        ))}
                    </div>
                )}

                {!loadingResumes && resumes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="text-center mb-4">
                            <img
                                src="/icons/info.svg"
                                alt="No resumes"
                                className="w-24 h-24 mx-auto mb-4 opacity-50"
                            />
                            <p className="text-gray-500 text-lg">
                                Get started by uploading your first resume
                            </p>
                        </div>
                        <Link
                            to="/upload"
                            className="primary-button w-fit text-xl font-semibold"
                        >
                            Upload Resume
                        </Link>
                    </div>
                )}

                {!loadingResumes && resumes.length > 0 && (
                    <div className="flex flex-col items-center justify-center pb-16 gap-4">
                        <Link
                            to="/upload"
                            className="primary-button w-fit text-xl font-semibold"
                        >
                            Upload Another Resume
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}