import "./About.css";

function About() {
  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">

        <div className="about-hero-content">

          <span className="about-badge">
            ✨ SMART RESUME BUILDER
          </span>

          <h1>
            Build a Resume That
            <span> Gets Noticed.</span>
          </h1>

          <p>
            Smart Resume Builder helps you create professional,
            ATS-friendly resumes with a simple, modern and
            intelligent resume-building experience.
          </p>

        </div>

      </section>


      {/* ABOUT PROJECT */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>01</span>

          <div>
            <h2>About the Project</h2>

            <p>
              A smarter way to create and manage your professional resume.
            </p>
          </div>
        </div>


        <div className="about-project-card">

          <div className="about-project-icon">
            📄
          </div>

          <div>
            <h3>Smart Resume Builder</h3>

            <p>
              Smart Resume Builder is a web application designed
              to make resume creation easier, faster and more
              professional. Users can create, edit, save and
              preview their resumes from a single platform.
            </p>

            <p>
              The application focuses on clean resume structure,
              professional presentation and an ATS-friendly
              approach to help users prepare better resumes
              for modern job applications.
            </p>
          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>02</span>

          <div>
            <h2>What You Can Do</h2>

            <p>
              Everything you need to build and manage your resume.
            </p>
          </div>
        </div>


        <div className="about-feature-grid">

          <article className="about-feature-card">
            <div className="feature-icon">✍️</div>
            <h3>Easy Resume Creation</h3>
            <p>
              Enter your professional information through
              a structured and simple resume form.
            </p>
          </article>


          <article className="about-feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Professional Templates</h3>
            <p>
              Choose from different resume styles designed
              for professional presentation.
            </p>
          </article>


          <article className="about-feature-card">
            <div className="feature-icon">📊</div>
            <h3>Resume Management</h3>
            <p>
              Save multiple resumes and manage your previous
              resume versions from one place.
            </p>
          </article>


          <article className="about-feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Data</h3>
            <p>
              User resume information is connected to
              authenticated accounts and protected access.
            </p>
          </article>


          <article className="about-feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive Experience</h3>
            <p>
              Designed to provide a comfortable experience
              across desktop, tablet and mobile devices.
            </p>
          </article>


          <article className="about-feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Future Ready</h3>
            <p>
              Built with a foundation that can support
              advanced AI-powered resume features.
            </p>
          </article>

        </div>

      </section>


      {/* TECHNOLOGY */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>03</span>

          <div>
            <h2>Technology Stack</h2>

            <p>
              Technologies powering the application.
            </p>
          </div>
        </div>


        <div className="about-tech-grid">

          <div className="about-tech-card">
            <strong>⚛️</strong>
            <span>React</span>
            <small>Frontend Framework</small>
          </div>

          <div className="about-tech-card">
            <strong>⚡</strong>
            <span>Vite</span>
            <small>Development Tool</small>
          </div>

          <div className="about-tech-card">
            <strong>🟨</strong>
            <span>JavaScript</span>
            <small>Application Logic</small>
          </div>

          <div className="about-tech-card">
            <strong>🎨</strong>
            <span>CSS</span>
            <small>User Interface</small>
          </div>

          <div className="about-tech-card">
            <strong>🔥</strong>
            <span>Firebase</span>
            <small>Authentication & Database</small>
          </div>

        </div>

      </section>


      {/* DEVELOPER */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>04</span>

          <div>
            <h2>Developer</h2>

            <p>
              The person behind Smart Resume Builder.
            </p>
          </div>
        </div>


        <div className="developer-card">

          <div className="developer-avatar">
            V
          </div>

          <div className="developer-info">

            <span className="developer-label">
              DEVELOPED BY
            </span>

            <h2>
              Vithun T R
            </h2>

            <p>
              BCA Student & Aspiring Software Developer
            </p>

            <p className="developer-description">
              Interested in software development, web
              technologies and building practical applications
              that solve real-world problems.
            </p>

          </div>

        </div>

      </section>


      {/* VERSION */}
      <section className="about-version">

        <div>
          <span>Current Version</span>
          <strong>1.0</strong>
        </div>

        <div className="version-status">
          <span className="status-dot"></span>
          Actively Developing
        </div>

      </section>


      {/* FOOTER MESSAGE */}
      <section className="about-final">

        <div className="about-final-icon">
          ✨
        </div>

        <h2>
          Build better. Apply smarter.
        </h2>

        <p>
          Your resume is more than a document.
          It is your first professional impression.
        </p>

      </section>

    </main>
  );
}

export default About;