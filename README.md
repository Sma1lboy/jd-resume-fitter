job descipriton template

```
We are the teams who create all of Meta's products used by billions of people around the world. Want to build new features and improve existing products like Messenger, Video, Groups, News Feed, Search and more? Want to solve unique, large scale, highly complex technical problems? Meta is seeking experienced full-stack Software Engineers to join our product teams. You can help build products that help us connect the next billion people, create new features that have billions of interactions per day and be a part of a team that’s working to help people connect with each other around the globe. Join us!
Software Engineer, Product Responsibilities
Full stack web/mobile application development with a variety of coding languages
Create consumer products and features using internal programming language Hack
Implement web or mobile interfaces using XHTML, CSS, and JavaScript
Work closely with our PM and design teams to define feature specifications and build products leveraging frameworks such as React & React Native
Work closely with operations and infrastructure to build and scale back-end services
Build report interfaces and data feeds
Establish self as an owner of a particular component, feature or system with expert end-to-end understanding
Successfully completes projects at large scope while maintaining a consistent high level of productivity
Minimum Qualifications
6+ years of programming experience in a relevant programming language
6+ years relevant experience building large-scale applications or similar experience
Experience with scripting languages such as Python, Javascript or Hack
Experience as an owner of a particular component, feature or system
Experience completing projects at large scope
Experience building and shipping high quality work and achieving high reliability
Track record of setting technical direction for a team, driving consensus and successful cross-functional partnerships
Experience improving quality through thoughtful code reviews, appropriate testing, proper rollout, monitoring, and proactive changes
Bachelor's degree in Computer Science, Computer Engineering, relevant technical field, or equivalent practical experience
Preferred Qualifications
Exposure to architectural patterns of large scale software applications
Experience in programming languages such as C, C++, Java, Swift, or Kotlin
For those who live in or expect to work from California if hired for this position, please click here for additional information.
About Meta
Meta builds technologies that help people connect, find communities, and grow businesses. When Facebook launched in 2004, it changed the way people connect. Apps like Messenger, Instagram and WhatsApp further empowered billions around the world. Now, Meta is moving beyond 2D screens toward immersive experiences like augmented and virtual reality to help build the next evolution in social technology. People who choose to build their careers by building with us at Meta help shape a future that will take us beyond what digital connection makes possible today—beyond the constraints of screens, the limits of distance, and even the rules of physics.

$70.67/hour to $208,000/year + bonus + equity + benefits

Individual compensation is determined by skills, qualifications, experience, and location. Compensation details listed in this posting reflect the base hourly rate, monthly rate, or annual salary only, and do not include bonus, equity or sales incentives, if applicable. In addition to base compensation, Meta offers benefits. Learn more about benefits at Meta.

Equal Employment Opportunity
Meta is proud to be an Equal Employment Opportunity employer. We do not discriminate based upon race, religion, color, national origin, sex (including pregnancy, childbirth, reproductive health decisions, or related medical conditions), sexual orientation, gender identity, gender expression, age, status as a protected veteran, status as an individual with a disability, genetic information, political views or activity, or other applicable legally protected characteristics. You may view our Equal Employment Opportunity notice here.

Meta is committed to providing reasonable accommodations for qualified individuals with disabilities and disabled veterans in our job application procedures. If you need assistance or an accommodation due to a disability, fill out the Accommodations request form.
```

user_profile template, should create a json object and save in chrome local storaget

```json
{
  "personalInfo": {
    "name": "Chong Chen",
    "phone": "608-213-6312",
    "email": "cchen686@wisc.edu",
    "linkedin": "linkedin.com/in/chong-chen-857214292/",
    "github": "github.com/Sma1lboy"
  },
  "education": [
    {
      "institution": "University of Wisconsin-Madison",
      "location": "Madison, WI",
      "degree": "Bachelor of Science in Computer Sciences",
      "gpa": "3.83/4.00",
      "dateRange": "Aug. 2023 -- May 2025"
    },
    {
      "institution": "The Ohio State University",
      "location": "Columbus, OH",
      "degree": "Bachelor of Science in Computer Engineering",
      "gpa": "3.74/4.00",
      "dateRange": "Aug. 2021 -- May 2023"
    }
  ],
  "workExperience": [
    {
      "title": "Software Engineer Intern",
      "company": "TabbyML, Inc.",
      "location": "Remote",
      "dateRange": "Aug. 2024 -- Present",
      "experiencePoints": [
        {
          "description": "Contributed to TabbyML's open-source code completion project (20k+ GitHub stars) by optimizing core algorithms, enhancing suggestion speed by 40% and accuracy by 25% for developers.",
          "mustInclude": true
        },
        {
          "description": "Developed a natural language outline editing feature, increasing daily active users by 5% and streamlining code structure planning time by 30%.",
          "mustInclude": true
        },
        {
          "description": "Designed and implemented an AI-powered commit message generator for monorepo and multi-repo setups, reducing average commit preparation time by 60%.",
          "mustInclude": false
        },
        {
          "description": "Created a Smart Apply feature for automatic code snippet insertion and implemented quick fix and explain this shortcut actions, improving user efficiency by 35%.",
          "mustInclude": false
        },
        {
          "description": "Actively participated in code reviews and documentation updates, enhancing project maintainability and fostering open-source community engagement, leading to a 20% increase in community contributions.",
          "mustInclude": false
        }
      ]
    },
    {
      "title": "Software Developer Intern",
      "company": "Shanghai MaiMiao Internet Ltd.",
      "location": "Remote",
      "dateRange": "Apr. 2024 -- Aug. 2024",
      "experiencePoints": [
        {
          "description": "Designed and developed a scalable, full-stack mobile app with React Native + Expo and Spring Boot + Java microservices, enhancing UX and business operations.",
          "mustInclude": true
        },
        {
          "description": "Set up a CI/CD pipeline automating builds, tests, and deployments, reducing manual efforts by 80%, accelerating releases by 50%, and ensuring code quality.",
          "mustInclude": false
        },
        {
          "description": "Implemented efficient RESTful APIs and a flexible message service interface, optimizing system performance by 30% and enabling integration with various backends.",
          "mustInclude": false
        },
        {
          "description": "Conducted code reviews, maintained documentation, and mentored junior developers, promoting best practices and collaboration.",
          "mustInclude": false
        }
      ]
    },
    {
      "title": "Software Engineer Intern",
      "company": "Virtual Hybrid Inc",
      "location": "Los Angeles, CA",
      "dateRange": "May 2023 -- Aug. 2023",
      "experiencePoints": [
        {
          "description": "Developed a scalable distributed-microservice project using C# and ASP.NET, resulting in a 30% improvement in system scalability.",
          "mustInclude": true
        },
        {
          "description": "Implemented location-based recommendations using C# and NTS topology suite, reducing nearby feed retrieval time by 120%.",
          "mustInclude": false
        },
        {
          "description": "Designed and built a News-Feed server with the fan-out pattern, cutting image upload wait time by 95%.",
          "mustInclude": false
        },
        {
          "description": "Enhanced data interchange efficiency with Redis Pub/Sub, reducing server load by 70% and improving user experience by minimizing back-end processing delays for image uploads.",
          "mustInclude": false
        }
      ]
    }
  ],
  "projects": [
    {
      "name": "MelodyBay",
      "technologies": "Java, Spring Boot, React, PostgreSQL, Docker, Kubernetes",
      "dateRange": "Jun. 2023 -- Jan. 2024",
      "projectPoints": [
        {
          "description": "Developed a microservice-based platform for sharing 50,000+ songs, utilizing Java and Spring Boot.",
          "mustInclude": true
        },
        {
          "description": "Implemented CI/CD pipelines, improving development efficiency by 50% and streamlining deployment processes.",
          "mustInclude": false
        },
        {
          "description": "Enhanced user experience and SEO by building a server-side rendering web application with Next.js.",
          "mustInclude": false
        }
      ]
    },
    {
      "name": "WebForum",
      "technologies": "",
      "dateRange": "",
      "projectPoints": [
        {
          "description": "Created a web forum where user can register, log in, post articles and comments under different topics, upload and share static files.",
          "mustInclude": true
        },
        {
          "description": "Write SpringMVC-like way to dispatcher different request by different controller and method.",
          "mustInclude": false
        }
      ]
    },
    {
      "name": "Codefox",
      "technologies": "",
      "dateRange": "",
      "projectPoints": [
        {
          "description": "Designed and implemented a robust authentication system with JWT token management, refresh token mechanism, and Google OAuth integration for seamless user experience",
          "mustInclude": true
        },
        {
          "description": "Architected and developed a modular build system that dynamically generates full-stack applications from natural language descriptions, handling complex dependency chains between components",
          "mustInclude": false
        },
        {
          "description": "Created an efficient file generation pipeline with virtual directory structure validation and topological sorting to ensure correct code dependency resolution",
          "mustInclude": false
        },
        {
          "description": "Implemented a comprehensive role-based access control system with menu-specific permissions and middleware guards for secure API endpoints",
          "mustInclude": false
        },
        {
          "description": "Built a real-time GraphQL subscription system for chat responses using PubSub patterns, supporting both streaming and synchronous communication models",
          "mustInclude": false
        },
        {
          "description": "Engineered a versatile project management service supporting forking, sharing, and GitHub integration with proper ownership tracking",
          "mustInclude": false
        },
        {
          "description": "Designed and implemented an extensible handler system with dependency injection patterns to manage complex asynchronous code generation workflows",
          "mustInclude": false
        },
        {
          "description": "Developed a secure file upload/download system with proper validation, rate limiting, and temporary storage management for project artifacts",
          "mustInclude": false
        },
        {
          "description": "Created an email verification service with templated emails, token-based confirmation, and cooldown periods to prevent abuse",
          "mustInclude": false
        },
        {
          "description": "Implemented comprehensive error handling and retry mechanisms for AI model interactions, ensuring system resilience and proper error propagation",
          "mustInclude": false
        }
      ]
    }
  ],
  "technicalSkills": {
    "languages": ["Rust", "TypeScript", "Go", "Java", "C#", "Python"],
    "frameworksAndTools": [
      "Actix-web",
      "Spring Boot",
      "ASP.NET Core",
      "React",
      "Node.js",
      "Docker",
      "Kubernetes",
      "AWS",
      "GCP",
      "Git",
      "PostgreSQL",
      "Redis"
    ]
  }
}
```

resume template

```
\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
\vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

\newcommand{\resumeItem}[1]{
\item\small{
{#1 \vspace{-1pt}}
}
}

\newcommand{\resumeSubheading}[4]{
\vspace{-2pt}\item
\begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
\textbf{#1} & #2 \\
\textit{\small#3} & \textit{\small #4} \\
\end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
\item
\begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
\textit{\small#1} & \textit{\small #2} \\
\end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
\item
\begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
\small#1 & \textit{\small #2} \\
\end{tabular*}\vspace{-5pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\begin{document}

\begin{center}
\textbf{\Huge \scshape FULL NAME} \\ \vspace{1pt}
\small
\href{sms:+10000000000}{PHONE} $|$
\href{mailto:email@example.com}{EMAIL} $|$
\href{https://www.linkedin.com/in/profile/}{\underline{LINKEDIN}} $|$
\href{https://github.com/username}{\underline{GITHUB}}
\end{center}

\section{Education}
\resumeSubHeadingListStart
\resumeSubheading
{UNIVERSITY NAME}{LOCATION}
{DEGREE IN FIELD; GPA: 0.00/0.00}{MMM. YYYY -- MMM. YYYY}
\resumeSubHeadingListEnd

\section{Experience}
\resumeSubHeadingListStart
\resumeSubheading
{JOB TITLE}{LOCATION}
{COMPANY NAME}{MMM. YYYY -- Present}
\resumeItemListStart
\resumeItem{Accomplishment with \textbf{X\%} improvement.}
\resumeItem{Technical contribution using TECHNOLOGIES.}
\resumeItemListEnd
\resumeSubHeadingListEnd

\section{Projects}
\resumeSubHeadingListStart
\resumeProjectHeading
{\textbf{PROJECT NAME} $|$ \emph{TECH1, TECH2, TECH3}}{\small\textit{MMM. YYYY -- MMM. YYYY}}
\resumeItemListStart
\resumeItem{Description of project with \textbf{measurable impact}.}
\resumeItemListEnd
\resumeSubHeadingListEnd

\section{Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
\small{\item{
\textbf{Languages}: LANG1, LANG2, LANG3 \quad \\
\textbf{Frameworks/Tools}: TOOL1, TOOL2, TOOL3
}}
\end{itemize}

\end{document}

```

anaysis jd prompt

```
You are a professional job analyst. Analyze the following job description and extract key requirements.

Job Description:
{{#1743555855138.job_description#}}

Extract and structure the following information:
1. Required technical skills (programming languages, frameworks, tools)
2. Required soft skills
3. Experience requirements (years and types)
4. Primary responsibilities
5. Industry keywords
6. Education requirements

Return your analysis in JSON format, for example:
{
  "technical_skills": ["Java", "React", "AWS", ...],
  "soft_skills": ["Communication", "Teamwork", ...],
  "experience": {
    "years": "2+",
    "types": ["Software Development", "Web Applications", ...]
  },
  "responsibilities": ["Design new features", "Write clean code", ...],
  "industry_keywords": ["Microservices", "RESTful APIs", ...],
  "education": "Bachelor's in Computer Science or related field"
}

Be comprehensive but precise in your extraction.
```

generate resume prompt

```
You are a professional job analyst. Analyze the following job description and extract key requirements.

Job Description:
{{#1743555855138.job_description#}}

Extract and structure the following information:
1. Required technical skills (programming languages, frameworks, tools)
2. Required soft skills
3. Experience requirements (years and types)
4. Primary responsibilities
5. Industry keywords
6. Education requirements

Return your analysis in JSON format, for example:
{
  "technical_skills": ["Java", "React", "AWS", ...],
  "soft_skills": ["Communication", "Teamwork", ...],
  "experience": {
    "years": "2+",
    "types": ["Software Development", "Web Applications", ...]
  },
  "responsibilities": ["Design new features", "Write clean code", ...],
  "industry_keywords": ["Microservices", "RESTful APIs", ...],
  "education": "Bachelor's in Computer Science or related field"
}

Be comprehensive but precise in your extraction.
```

extract resume code

```python
def main(input: str) -> dict:
    arg1 = input

    start_tag = "<GENERATE>"
    end_tag = "</GENERATE>"

    if start_tag in arg1 and end_tag in arg1:
        start_pos = arg1.find(start_tag) + len(start_tag)
        end_pos = arg1.find(end_tag)

        # Extract the content between tags
        extracted_content = arg1[start_pos:end_pos].strip()
        return {
            "result": extracted_content
        }
    else:
        # Return empty string if tags not found
        return {
            "result": ""
        }
```
