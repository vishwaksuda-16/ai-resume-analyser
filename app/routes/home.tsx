import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import {resumes} from "../../constants";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Analyser" },
    { name: "description", content: "Smart Resume AI for your dream job!" },
  ];
}

export default function Home() {
    const { auth } = usePuterStore();
    const navigate = useNavigate();

    useEffect( () => {
        if(!auth.isAuthenticated)
            navigate('/auth?next=/');
    }, [auth.isAuthenticated])

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <section className="main-section max-w-6xl mx-auto px-4 md:px-8">
            <div className="page-heading py-16">
                <h1>Track your Applications & Resume Ratings</h1>
                <h2>Review your submissions and check AI-powered feedback.</h2>
            </div>

            {resumes.length > 0 && (
                <div className="resumes-section grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pb-16">
                    {resumes.map((resume) => (
                        <ResumeCard key={resume.id} resume={resume}/>
                    ))}
                </div>
            )}
        </section>
    </main>
}
