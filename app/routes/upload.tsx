import React, {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdfToImage";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const[isProcessing, setIsProcessing] = useState(false);
    const[statusText, setStatusText] = useState('');
    const[file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file : File | null) => {
        setFile(file)
    }

    const handleAnalyse = async({ companyName, jobTitle, jobDescription, file } : { companyName: string, jobTitle: string, jobDescription: string, file: File} ) => {
        try {
            setIsProcessing(true);
            setStatusText("Uploading file...");

            console.log("Starting upload...", file.name);
            const uploadedFile = await fs.upload([file]);
            console.log("Upload result:", uploadedFile);

            if(!uploadedFile || !uploadedFile.path) {
                console.error("Upload failed or no path returned:", uploadedFile);
                setStatusText('Error: Failed to upload file. No path returned.');
                setIsProcessing(false);
                return;
            }

            console.log("File uploaded successfully:", uploadedFile.path);
            setStatusText('Converting file to image...')

            const imageFile = await convertPdfToImage(file);
            console.log("Image conversion result:", imageFile);

            if(!imageFile || !imageFile.file || imageFile.error) {
                console.error("Image conversion failed:", imageFile);
                setStatusText(`Error: ${imageFile?.error || 'Failed to convert pdf to image.'}`);
                setIsProcessing(false);
                return;
            }

            setStatusText('Uploading image...');

            // Create File object from the converted image
            const fileToUpload = imageFile.file;

            console.log("Uploading image file:", fileToUpload.name, fileToUpload.size);
            const uploadedImage = await fs.upload([fileToUpload]);
            console.log("Image upload result:", uploadedImage);

            if(!uploadedImage || !uploadedImage.path) {
                console.error("Image upload failed or no path returned:", uploadedImage);
                setStatusText('Error: Failed to upload image. No path returned.');
                setIsProcessing(false);
                return;
            }

            console.log("Image uploaded successfully:", uploadedImage.path);
            setStatusText('Preparing data...');

            const uuid = generateUUID();
            const data: {
                id: string;
                resumePath: string;
                imagePath: string;
                companyName: string;
                jobTitle: string;
                jobDescription: string;
                feedback: any;
            } = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: {}
            }

            console.log("Saving to KV store:", data);
            const kvSetResult = await kv.set(`resume:${uuid}`, JSON.stringify(data));
            console.log("KV set result:", kvSetResult);

            setStatusText('Analysing data...');
            console.log("Starting AI feedback analysis...");

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({AIResponseFormat: "", jobTitle, jobDescription })
            )

            console.log("AI feedback result:", feedback);

            if(!feedback || !feedback.message) {
                console.error("AI feedback failed:", feedback);
                setStatusText('Error: Failed to analyse resume. No feedback returned.');
                setIsProcessing(false);
                return;
            }

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            console.log("Raw feedback text:", feedbackText);

            try {
                // Remove markdown code blocks if present
                let cleanedText = feedbackText.trim();
                if (cleanedText.startsWith('```json')) {
                    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
                } else if (cleanedText.startsWith('```')) {
                    cleanedText = cleanedText.replace(/```\n?/g, '');
                }

                console.log("Cleaned feedback text:", cleanedText);
                const rawFeedback = JSON.parse(cleanedText);
                console.log("Raw parsed feedback:", rawFeedback);

                // Check if the response is in the correct format
                if (rawFeedback.overallScore !== undefined) {
                    // Correct format - use as is
                    data.feedback = rawFeedback;
                    console.log("Using correct format feedback");
                } else {
                    // Old format - transform it
                    console.log("Transforming old format feedback");
                    const jobMatch = rawFeedback.job_match_analysis || {};
                    const technicalScore = Math.round((jobMatch.technical_alignment || 0) * 10);
                    const experienceScore = Math.round((jobMatch.experience_level || 0) * 10);
                    const skillsScore = Math.round((jobMatch.skills_coverage || 0) * 10);
                    const overallScore = Math.round((rawFeedback.overall_rating || 0) * 10);

                    data.feedback = {
                        overallScore: overallScore,
                        toneAndStyle: {
                            score: technicalScore,
                            tips: (rawFeedback.formatting_improvements || []).map((tip: string) => ({
                                type: "improve",
                                tip: tip.substring(0, 50),
                                explanation: tip
                            }))
                        },
                        content: {
                            score: skillsScore,
                            tips: (rawFeedback.content_suggestions || []).map((tip: string) => ({
                                type: "improve",
                                tip: tip.substring(0, 50),
                                explanation: tip
                            }))
                        },
                        structure: {
                            score: technicalScore,
                            tips: (rawFeedback.formatting_improvements || []).map((tip: string) => ({
                                type: "improve",
                                tip: tip.substring(0, 50),
                                explanation: tip
                            }))
                        },
                        skills: {
                            score: skillsScore,
                            tips: (rawFeedback.specific_improvements || []).map((tip: string) => ({
                                type: "improve",
                                tip: tip.substring(0, 50),
                                explanation: tip
                            }))
                        },
                        ATS: {
                            score: technicalScore,
                            tips: (rawFeedback.ats_optimization || []).map((tip: string) => ({
                                type: "improve",
                                tip: tip
                            }))
                        }
                    };
                }

                console.log("Transformed feedback object:", data.feedback);
                console.log("Overall score:", data.feedback.overallScore);
                console.log("Category scores:", {
                    toneAndStyle: data.feedback.toneAndStyle.score,
                    content: data.feedback.content.score,
                    structure: data.feedback.structure.score,
                    skills: data.feedback.skills.score,
                    ATS: data.feedback.ATS.score
                });
            } catch (parseError) {
                console.error("Failed to parse feedback JSON:", parseError);
                console.error("Attempted to parse:", feedbackText);
                setStatusText('Error: Failed to parse AI feedback.');
                setIsProcessing(false);
                return;
            }

            console.log("Updating KV store with feedback...");
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analysis Complete! Redirecting...');
            console.log("Final data:", data);

            // Navigate to the resume page after a short delay
            setTimeout(() => {
                navigate(`/resume/${uuid}`);
            }, 1500);

        } catch (error) {
            console.error('Error during analysis:', error);
            setStatusText(`Error: ${error instanceof Error ? error.message : 'An error occurred'}`);
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) {
            setStatusText('Please upload a resume file.');
            return;
        }

        if(!companyName || !jobTitle || !jobDescription) {
            setStatusText('Please fill in all fields.');
            return;
        }

        handleAnalyse({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            <section className="main-section max-w-6xl mx-auto px-4 md:px-8">
                <div className="page-heading py-16">
                    <h1>Smart Feedback for your dream job</h1>
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-4">
                            <h2 className="text-xl font-semibold">{statusText}</h2>
                            <img
                                src="/images/resume-scan.gif"
                                alt="Processing"
                                className="w-full max-w-md mx-auto rounded-lg"
                            />
                            <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '45%'}}></div>
                            </div>
                        </div>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips.</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input
                                    type="text"
                                    name="company-name"
                                    id="company-name"
                                    placeholder="Company Name"
                                    required
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input
                                    type="text"
                                    name="job-title"
                                    id="job-title"
                                    placeholder="Job Title"
                                    required
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea
                                    rows={5}
                                    name="job-description"
                                    id="job-description"
                                    placeholder="Job Description"
                                    required
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button className="primary-button" type="submit" disabled={!file}>
                                Analyse Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload