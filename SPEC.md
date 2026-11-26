# NextStep — Autonomous AI Product Prototype Development

## 1. Objective and operating instructions

Build a complete, polished, functional AI-powered web application called NextStep for a UCLA Anderson graduate-level Product Management course.

Act as an autonomous senior full-stack software engineer, AI engineer, product designer, and QA engineer.

The objective is to deliver a working, presentation-ready prototype, not merely a mockup, landing page, or technical proof of concept.

The existing GitHub repository is:

https://github.com/revrao/NextStep

The project owner wants to minimize manual supervision and allow you to complete as much development independently as possible.

Operating instructions:

- Inspect the repository and initialize the project if necessary.
- Create an implementation plan and immediately proceed with development.
- Make reasonable technical, architectural, and design decisions independently.
- Do not wait for approval after completing individual milestones.
- Only request human input when a genuine blocker cannot be resolved independently.
- If credentials or external services are unavailable, implement the integration with a configurable mock alternative and continue development.
- Prioritize complete functionality over unnecessary technical complexity.
- Test, review, debug, and refine the application before declaring it complete.
- Maintain a PROGRESS.md file containing completed work, outstanding tasks, blockers, and decisions.
- Update progress documentation throughout development.
- Do not purchase services, enable paid billing, or incur external charges.
- Commit and push validated changes to GitHub at meaningful development milestones.
- Ensure that another AI coding agent can resume development if necessary.
- Do not modify unrelated repositories, existing Vercel projects, Netlify projects, or files outside the NextStep project.

The expected outcome is a working application suitable for a live classroom demonstration on December 3, 2026, with prototype evidence available for the November 29 PRD submission.

The project owner does not currently have a Gemini API key. Do not wait for one before beginning development. Build and test using mock responses initially, implement the real integration, and provide instructions for activating live AI later.

## 2. GitHub and version control

The local project should be connected to:

https://github.com/revrao/NextStep

Before beginning development:

- Verify the current working directory.
- Inspect the Git repository configuration.
- Verify that the Git remote points to the correct NextStep repository.
- Inspect existing branches, files, and uncommitted changes.
- Confirm that the repository is properly initialized.

Throughout development:

- Commit completed work at meaningful development milestones.
- Push commits to GitHub after successful validation.
- Use descriptive commit messages.
- Keep GitHub synchronized with the local project.
- Maintain a clean and useful commit history.
- Include appropriate .gitignore rules.
- Never commit API keys, credentials, environment files, sensitive information, or unnecessary generated files.
- Do not commit private course materials without explicit authorization.
- Never force-push, delete existing branches, or destructively overwrite existing work.
- Never modify unrelated repositories.
- If GitHub authentication or network permissions prevent pushing, continue developing locally and document the issue.

The repository is currently public, so exercise particular care regarding secrets and confidential information.

Use the existing repository as the single source of truth for the project.

Do not connect or deploy to Vercel until the initial implementation is ready for review, unless explicitly instructed by the project owner.

## 3. Product background

NextStep is an AI-powered developmental activity recommendation platform for parents and caregivers of children ages 0–5.

The initial target customer is a family that has previously worked with a developmental counselor, has seen meaningful progress, and no longer feels frequent appointments are necessary but still wants personalized developmental activities to practice at home.

Parents often struggle to determine which activities are appropriate for their child's current abilities. Generic online resources and activity books do not necessarily adapt to the child's individual progression. General-purpose AI chatbots require repeated explanations of the child's background and may provide unsuitable recommendations.

NextStep addresses this problem by combining:

- A structured child profile
- An activity recommendation library
- AI-powered personalization
- Caregiver feedback
- Activity history
- Conservative progression rules
- Developmental and safety safeguards

NextStep is a supplement to professional developmental counseling, not a replacement for it.

The initial commercial target market is Simi Valley, California, with potential expansion through the Ventura-to-Burbank corridor. The website itself does not need geographic restrictions for the prototype.

The central product hypothesis is that feedback-informed recommendations provide enough ongoing value for caregivers to return regularly.

This is an educational prototype, not a clinically validated or production-ready child development product.

## 4. Core jobs to be done

The primary caregiver should be able to:

1. Understand what their child is ready to practice next.
2. Find appropriate activities that can realistically be completed at home.
3. Understand why an activity was recommended.
4. Record how their child responded to an activity.
5. Receive subsequent recommendations that reflect previous feedback.
6. Maintain a simple record of activities and developmental interests.
7. Feel supported without being overwhelmed by information or pressured to compare their child with others.

The application's central AI behavior is adaptive activity recommendation based on caregiver-reported information.

Prioritize this behavior above all secondary features.

## 5. Technical architecture

Use the following preferred stack:

- Next.js with App Router
- TypeScript
- React
- Tailwind CSS
- Zod for input and output validation
- Google Gemini Developer API
- Browser-local storage for fictional demo profiles and activity history
- Vercel Hobby for hosting and deployment
- GitHub for version control
- Vitest or another appropriate unit testing framework
- Playwright for end-to-end testing where supported

Use stable, compatible dependency versions and include a dependency lockfile.

Keep the architecture lightweight and maintainable.

Do not require Supabase, a paid database, paid authentication, vector databases, or external infrastructure for the initial prototype.

Implement the AI integration through a server-side Next.js API route and an extensible provider interface.

Use environment variables:

- GEMINI_API_KEY
- GEMINI_MODEL
- AI_MODE
- DEMO_ACCESS_CODE, if needed
- Any additional server-side configuration genuinely required

Prefer a capable, currently available free-tier Gemini Flash model. Verify the model identifier, availability, and free-tier eligibility against official documentation before configuring the default model.

Make the model configurable without code changes.

Include a .env.example file and ensure .env.local and other credential-containing files are excluded from Git.

Never commit real API credentials or expose them to frontend code.

The application must start, build, and remain demonstrable without an API key through an explicitly labeled demo mode.

## 6. Visual design and user experience

Create a polished, modern, caregiver-friendly website that feels like a thoughtfully designed consumer product rather than a generic AI-generated dashboard.

The visual identity should communicate trust, warmth, simplicity, and encouragement.

Suggested design direction:

- Warm off-white backgrounds
- Soft sage green or muted teal primary colors
- Light peach or pastel accent colors
- Rounded cards and approachable typography
- Generous whitespace
- Simple, consistent icons
- Clear visual hierarchy
- Minimal clutter
- Subtle, purposeful animations and transitions

Avoid an overly clinical healthcare appearance, a generic enterprise dashboard, excessively childish styling, and unnecessary visual effects.

The website is designed for adults caring for children, not for children themselves.

Make the experience responsive on desktop, tablet, and mobile.

Include accessible contrast, keyboard navigation, meaningful labels, clear loading states, error messages, and empty states.

Use simple illustrations and icons rather than relying on paid external image services.

Suggested brand tagline:

"Small steps. Meaningful progress."

Maintain consistent branding across all pages.

Review the actual rendered website using browser testing and screenshots where supported. Do not assume that successful compilation means the visual experience is satisfactory.

Make all major navigation links, buttons, forms, and interactions functional. Avoid placeholder buttons or unfinished pages that appear complete.

## 7. Required pages and functionality

### A. Landing page

Create a professional product landing page with:

- NextStep branding
- A clear value proposition
- Explanation of the problem being solved
- A concise explanation of how the product works
- Benefits of personalized developmental activities
- Explanation of feedback-informed recommendations
- Clear positioning as a supplement to professional guidance
- Get Started button
- Try Demo button
- Accessible safety and privacy information

Avoid unsupported clinical claims, fabricated testimonials, fabricated user counts, or claims of professional endorsement.

### B. Child profile onboarding

Create a short, intuitive, multi-step onboarding flow.

Collect only fictional or non-identifying information necessary for the demonstration:

- Child nickname
- Age in months, from 0 to 71 months
- Developmental areas of interest
- Caregiver-reported abilities and observations
- Preferred activity duration
- Available household materials
- Activity preferences

Developmental categories:

- Language and communication
- Fine motor skills
- Gross motor skills
- Cognitive development
- Social and emotional development

Support uncertain or unknown answers.

Use neutral language. Do not characterize a child as behind, abnormal, advanced, or delayed based on onboarding responses.

Provide preconfigured fictional profiles so a classroom demonstration can begin immediately.

Include explicit acknowledgement that this is an educational prototype intended only for fictional child data.

### C. Caregiver dashboard

Build a dashboard that includes:

- Friendly personalized greeting
- Active child profile
- Recommended activities
- Developmental focus areas
- Recent activity history
- Activity completion summary
- Request New Recommendations button
- Profile editing
- Demo reset functionality

Make the recommended activities the primary focus of the dashboard.

Do not display clinical developmental scores, inferred developmental age, or medical risk scores.

### D. AI activity recommendations

Generate a small set of approximately three personalized recommendations per request, or fewer when insufficient eligible activities exist.

Each recommendation must contain:

- Activity title
- Developmental focus
- Estimated duration
- Required materials
- Clear step-by-step instructions
- Explanation of why the activity was selected
- Appropriate supervision or safety notes
- Relevant activity source or provenance
- Simple difficulty designation

Allow caregivers to view individual activity details, select an activity, and mark an activity as attempted or completed.

Recommendation generation must use the child profile, relevant caregiver-reported abilities, available materials, preferences, and previous activity history.

Do not implement this as a generic open-ended chatbot.

The personalized recommendation rationale should clearly demonstrate the value added by AI.

### E. Activity feedback

After completing or attempting an activity, allow caregivers to record:

- Mastered
- Enjoyed
- Struggled
- Not interested

Allow multiple compatible observations where appropriate, such as enjoyed and struggled.

Prefer structured feedback fields over unrestricted text.

If optional free-text observations are supported, restrict their length, warn users against entering sensitive information, and do not transmit unnecessary free text to the AI provider.

Save feedback to the child's activity history.

After feedback is recorded, allow the caregiver to request updated recommendations.

Clearly explain what changed and why.

Examples of expected behavior:

- Struggled: Recommend an eligible activity that practices a similar skill with less complexity.
- Enjoyed: Consider another eligible activity involving a related interest or skill.
- Not interested: Offer a different activity format or developmental focus.
- Mastered: Consider modest progression only when enough supporting observations and prerequisites exist.

A single successful attempt must never automatically trigger a substantial difficulty increase.

Make the feedback loop intuitive and visually apparent. The user should understand that their observations influence subsequent recommendations.

### F. Activity history and progress

Display:

- Previously recommended activities
- Attempted and completed activities
- Caregiver feedback
- Number of activities completed
- Frequently practiced developmental categories
- Changes in preferences
- Recommendation rationale over time

Use descriptive activity statistics rather than clinical measurements of developmental progress.

### G. Profile and caregiver settings

Allow users to:

- Edit fictional profile information
- Switch between sample child profiles
- View and reset local activity history
- Delete locally stored profile information
- Review the prototype's privacy and safety limitations

If development resources permit, provide a simulated caregiver-role switching experience to demonstrate how a parent or grandparent might interact with the same profile.

Clearly identify that production-grade authentication, authorization, and cross-device caregiver sharing have not been implemented.

Do not imply that simulated caregiver roles provide real security.

## 8. AI recommendation engine

The AI should perform constrained, context-aware recommendation selection rather than unrestricted activity creation.

Implement the following sequence:

1. Validate the user profile and relevant activity history.
2. Retrieve applicable activities from the local activity library.
3. Apply deterministic eligibility and safety rules.
4. Provide Gemini with only the appropriate candidate activities and necessary fictional profile context.
5. Ask Gemini to select and rank the most suitable candidates.
6. Require structured JSON output.
7. Validate the output against a schema.
8. Verify selected activity IDs against the eligible candidate set.
9. Validate recommendation rationale and reject unsupported or unsafe content.
10. Render activity instructions from the original library rather than allowing the model to rewrite safety-sensitive instructions.

The structured AI response should include:

- Selected activity identifiers
- Recommendation order
- Concise personalized rationale
- References to relevant caregiver feedback
- Any applicable uncertainty indicator

The model must not invent new activity identifiers, materials, developmental prerequisites, instructions, or sources.

Where practical, use validated reason codes and references to known profile attributes or feedback events to support the recommendation rationale. Use constrained templates if unrestricted explanatory text introduces unnecessary safety risks.

Implement conservative handling of invalid, incomplete, unsafe, or unsupported model outputs.

Use a deterministic fallback when appropriate, clearly labeled as a non-AI fallback.

Do not claim that automated validation can guarantee the absence of all unsafe or unsupported content.

Ensure that feedback meaningfully influences live recommendation behavior. Do not hardcode the expected demonstration sequence and present it as live AI.

Separate the recommendation engine from the UI so that its behavior can be tested independently.

## 9. Activity library and grounding data

Create an initial demonstration library of approximately 30–50 activities covering the five developmental categories and a range of ages.

Each activity should have structured metadata, including:

- Unique ID
- Title
- Developmental category
- Minimum and maximum applicable age
- Relevant abilities or prerequisites
- Difficulty level
- Estimated duration
- Materials
- Instructions
- Supervision requirements
- Safety exclusions
- Source URL, where verifiable
- Source organization
- Date accessed, where applicable
- Review status
- Content version

Prefer reliable public resources from organizations such as the CDC, UNICEF, and reputable early-childhood development organizations.

Verify sources before attributing activities to them.

Use original summaries of supported material rather than copying entire source documents.

Distinguish source-supported content from implementation assumptions, including age ranges, difficulty levels, and prerequisite rules that have not been independently validated.

Never fabricate sources or professional review.

If external research is unavailable, use clearly labeled synthetic activity fixtures solely for prototype demonstration.

All activities that have not received actual professional review must be marked as unreviewed demonstration content.

Keep the prototype explicitly restricted to fictional profiles and simulated use. Do not present unreviewed content as suitable for real children.

Document the content review workflow that would be required before real-world deployment.

The activity library is grounding data. It is separate from the evaluation dataset and the usage dataset.

## 10. Safety, guardrails, and privacy

Safety is a core product requirement.

Implement deterministic guardrails before and after AI generation.

The application must not:

- Diagnose or screen for developmental delays
- Provide medical advice
- Provide treatment plans
- Recommend condition-specific interventions
- Claim to replace developmental counseling or therapy
- Infer developmental disorders from caregiver feedback
- Recommend activities outside eligibility constraints
- Suggest hazardous materials or unsupervised risky activities
- Escalate difficulty aggressively
- Treat caregiver observations as clinical assessments

If a caregiver reports a possible developmental concern, respond conservatively and recommend speaking with an appropriate qualified professional.

If input suggests an immediate emergency, display brief guidance to seek urgent professional or emergency assistance rather than recommending activities.

For uncertain cases, missing prerequisites, or insufficient information, request clarification or abstain.

Treat caregiver-provided text as untrusted data. It must never override application instructions or safety policies.

Use synthetic profiles exclusively for the classroom prototype.

Do not collect or transmit:

- Real child names
- Dates of birth
- Photographs or videos
- Addresses
- Medical records
- Contact information
- Sensitive family information

Minimize the information transmitted to Gemini. Prefer structured, fictional profile data and exclude unnecessary identifying fields.

Use fixed fictional profiles and constrained structured inputs for the live demonstration wherever practical.

Do not include raw sensitive information in logs.

Make local data deletion straightforward.

Clearly communicate that the product is an educational prototype, has not been clinically validated, and is not intended for actual child-development decisions.

Document the limitations of automated guardrails and the additional privacy, security, and professional review requirements necessary before production deployment.

## 11. AI evaluation framework

The professor requires evals as acceptance tests, not just a description of future testing.

Before implementing the recommendation engine, create a versioned evaluation specification with explicit acceptance thresholds.

Create at least 30 synthetic evaluation cases across:

- Age suitability
- Developmental category relevance
- Prerequisite matching
- Available material constraints
- Difficulty progression
- Adaptation to struggled feedback
- Adaptation to enjoyed feedback
- Adaptation to not-interested feedback
- Conservative handling of mastered feedback
- Missing information
- Medical or diagnostic requests
- Emergency-related inputs
- Prompt injection attempts
- Invalid model responses
- Hallucinated activity identifiers
- API failures and quota errors

Include several paired evaluation cases in which the child profile stays the same but caregiver feedback changes.

Use deterministic checks wherever possible.

Include a separate human-review rubric for subjective qualities such as personalization, usefulness, clarity, and developmental suitability.

Do not imply that automated scores substitute for qualified professional assessment.

Initial proposed acceptance thresholds:

- Valid activity IDs and grounding: 100%
- Deterministic age and prerequisite eligibility: 100%
- Critical safety and refusal test cases: 100%
- Structured output schema compliance: 100% for responses displayed as AI recommendations
- Correct feedback adaptation: at least 90% of applicable cases
- Subjective personalization and relevance: at least 90% of reviewed cases
- Live recommendation latency: target median of 5 seconds or less and 95th percentile of 15 seconds or less
- External AI expenditure: $0 within the configured free tier
- API failure handling: 100% of tested failure scenarios handled gracefully

Treat these thresholds as prototype targets, not demonstrated performance or proof of real-world safety.

Preserve a held-out set of evaluation cases that is not used to tune the prompt.

Provide separate commands for mock evaluations and live-model evaluations.

Record results by:

- Evaluation case
- Expected behavior
- Actual behavior
- Pass or fail
- Failure category
- Model identifier
- Prompt version
- Activity library version
- Latency
- Token usage, when available
- Estimated cost or free-tier status
- Execution date
- Mock or live execution mode

Generate a concise evaluation report containing actual measured outcomes.

Never invent evaluation results.

If live credentials are unavailable, clearly distinguish passed mock evaluations from unexecuted live evaluations.

Do not present mock evaluation performance as evidence of actual Gemini performance.

Distinguish raw model failures from failures prevented by application-level guardrails. Track fallback rates and do not count fallback responses as successful live-model recommendations.

Allow live evaluations to run in small batches to accommodate free-tier rate limits.

If the model fails critical safety or grounding acceptance tests, keep live recommendations disabled until the issue is addressed and retested.

## 12. Metrics and instrumentation

Implement lightweight, local instrumentation for the core product experience.

Proposed North Star Metric:

Weekly completed NextStep-recommended activities per active family.

Track relevant events such as:

- Profile created
- Recommendation requested
- Recommendation successfully generated
- Activity viewed
- Activity attempted
- Activity completed
- Feedback submitted
- Follow-up recommendation requested
- Recommendation skipped or overridden
- Safety guardrail triggered
- AI request failed

Track supporting metrics:

- Onboarding completion rate
- Recommendation-to-activity completion rate
- Feedback submission rate
- Repeat recommendation rate
- Weekly active families
- Week-one retention
- Eval pass rate
- Grounding violation rate
- Human-override rate
- API failure rate
- Recommendation latency
- AI cost per successful recommendation

Document the definition, numerator, denominator, and measurement window for relevant metrics.

Create a separate prototype insights or developer dashboard showing local demonstration events and available evaluation results.

Clearly distinguish synthetic demonstration data from actual measured interactions.

For metrics that cannot yet be measured meaningfully, display insufficient data rather than inventing values.

Do not fabricate production engagement, retention, user satisfaction, or commercial performance.

Local prototype analytics do not represent platform-wide analytics or actual family-level retention.

Keep metrics-related functionality secondary to the caregiver experience.

## 13. Prompt and behavior versioning

Store AI system instructions as dedicated, versioned files in the repository rather than embedding all prompts directly inside UI components.

Version together:

- AI system prompt
- Output schema
- Recommendation behavior rules
- Safety rules
- Activity library
- Evaluation cases
- Evaluation reports

Maintain a changelog describing behavior changes and their corresponding evaluation results.

Document the intended voice:

- Warm
- Encouraging
- Nonjudgmental
- Clear
- Concise
- Conservative about uncertainty
- Respectful of caregiver autonomy

The system must not pressure caregivers or make unsupported claims about their child's development.

Document the intended data flywheel:

Caregiver usage → activity feedback → identification of recommendation failures → new evaluation cases → improved prompts and recommendation behavior.

Do not implement automatic self-modification of prompts or uncontrolled model learning.

## 14. Demo reliability and cost control

The project has a target external infrastructure and AI budget of $0.

Use the Gemini free tier and Vercel Hobby hosting only.

Do not enable paid billing or automatically switch to paid providers or models.

Minimize AI requests by:

- Generating recommendations only after deliberate user actions
- Avoiding unnecessary requests during page loads
- Reusing recommendations until relevant information changes
- Sending only necessary context
- Restricting response length
- Limiting retries
- Preventing duplicate requests
- Implementing sensible server-side request controls

Provide an explicitly labeled offline/mock mode.

Mock mode should support the full user journey and demonstrate the intended interaction design.

Live AI mode must make actual model requests.

The interface must accurately indicate whether the current recommendation is live AI-generated, simulated, or a deterministic fallback.

Protect the live demo endpoint from uncontrolled public usage using server-side demo access restrictions and appropriate rate limits.

Do not rely exclusively on client-side limits or assume in-memory rate limiting is persistent across serverless function instances.

If reliable server-side usage controls cannot be implemented within the free infrastructure constraints, restrict live AI to an access-controlled classroom demonstration and leave public visitors in mock mode.

If necessary, keep the live endpoint disabled until the project owner configures appropriate access controls.

Do not expose credentials, raw prompts, or sensitive logs.

The project owner already hosts another project on Vercel. Minimize unnecessary builds, deployments, function invocations, and bandwidth consumption to avoid affecting the shared Hobby usage allowance.

Do not configure third-party analytics, paid monitoring, or external tracking services.

## 15. Presentation demonstration flow

Create a reproducible demonstration that can be completed in approximately two minutes.

Suggested scenario:

1. Open the NextStep landing page.
2. Select a fictional three-year-old child's demo profile.
3. Request personalized activities.
4. Open a recommended language activity.
5. Show its instructions and personalized recommendation rationale.
6. Record that the child enjoyed the activity but struggled with part of it.
7. Request updated recommendations.
8. Show how the recommendation changes to reflect the feedback without aggressively increasing difficulty.
9. Briefly show the activity history and AI evaluation evidence.

Include a second optional demonstration showing appropriate handling of a developmental concern or diagnostic request.

Provide a reset function so the demonstration can be repeated reliably.

Provide a backup demonstration path in case Gemini experiences an outage or free-tier quota exhaustion during the presentation.

Clearly label any simulated behavior.

## 16. Out-of-scope functionality

Do not build:

- Medical diagnosis or screening
- Clinical treatment recommendations
- Replacement for therapy
- Video or sensor monitoring
- K–12 education
- General parenting advice
- Sleep or feeding recommendations
- Physical play kit commerce
- Counselor appointment booking
- Subscription billing
- Full production authentication infrastructure
- Complex multi-agent systems
- Custom model training or fine-tuning
- Large-scale analytics infrastructure

Focus on one customer segment, one core job, and one meaningful AI behavior.

## 17. Academic requirements

This prototype is part of a graduate Product Management course.

The assignment requires:

- Product strategy and positioning
- User stories that carry the product strategy
- A working AI prototype that demonstrates actual behavior
- Success metrics and KPIs
- Go-to-market strategy
- Prototype-first evidence
- Evals as acceptance tests
- Data and grounding
- Failure modes and guardrails
- Prompts and behavior versioned together

The prototype should provide evidence that the team can reference in its PRD and presentation.

Create a concise prototype evidence document that explains:

- What product hypothesis the prototype tests
- Which user stories are implemented
- What the AI does and does not do
- How grounding works
- How the feedback loop works
- What acceptance tests were defined
- Which evaluations were actually executed
- Actual evaluation outcomes
- Observed failure modes
- Implemented guardrails
- Proposed success metrics
- Remaining product risks and limitations
- What would need to be validated in a real-world field trial

Distinguish implemented functionality, proposed product features, and actual validation evidence.

Do not write or submit the team's final PRD on their behalf.

Do not invent customer interviews, professional reviews, pilot results, or validation evidence.

## 18. Documentation and deliverables

Include:

- README.md with setup and Vercel deployment instructions
- SPEC.md containing the complete project specification
- AGENTS.md with repository-specific engineering guidance
- CLAUDE.md with consistent repository-specific engineering guidance
- PROGRESS.md with implementation status
- .env.example
- Product scope and architectural decisions
- Activity library schema and provenance documentation
- Versioned AI prompts and safety rules
- Evaluation specification
- Evaluation dataset
- Runnable evaluation scripts
- Actual evaluation results
- Known limitations and unresolved issues
- KPI and event definitions
- Risk and guardrail documentation
- A concise classroom demonstration guide
- A prototype evidence summary suitable for referencing in the team's PRD and presentation
- An AI-use log documenting requests, implementation decisions, and alternative suggestions considered

Organize supporting documentation into a logical directory structure.

Keep documentation concise, accurate, and synchronized with the implementation.

Avoid duplicating the same documentation across numerous files unnecessarily.

## 19. Vercel deployment requirements

Vercel Hobby is the designated hosting provider for NextStep.

Prepare the application for deployment from its GitHub repository:

https://github.com/revrao/NextStep

The project owner already has an existing Vercel Hobby workspace hosting a separate Procurement Audit Planner project.

NextStep must be deployed as an entirely separate Vercel project.

Do not modify, redeploy, rename, delete, or change environment variables for the existing Procurement Audit Planner project.

Do not interact with the project owner's existing Community Hub deployment on Netlify.

Requirements:

- Ensure native Next.js compatibility with Vercel.
- Use the appropriate Next.js production build command.
- Verify compatible Node.js and package manager versions.
- Use automatic framework detection where appropriate.
- Do not configure the application as a static export because live AI requires server-side execution.
- Ensure Next.js API route handlers are compatible with Vercel.
- Ensure Gemini API calls are performed server-side.
- Configure sensitive environment variables through Vercel's project-level environment variable settings.
- Never store API credentials in GitHub.
- Ensure activity history and local profile persistence continue working after deployment.
- Verify routing, page refreshes, error states, and responsive layouts.
- Use the default free vercel.app domain.
- Do not purchase a custom domain.
- Avoid unnecessary production deployments and excessive function usage.
- Do not enable paid services, paid billing, or a Pro trial.

Provide step-by-step deployment instructions explaining:

1. How to import the NextStep GitHub repository into Vercel.
2. How to create a new project within the existing Hobby workspace.
3. How to configure production branch and build settings.
4. How to add Gemini and demo access environment variables.
5. How to deploy the website.
6. How to verify live AI functionality on the deployed website.
7. How to troubleshoot common deployment issues.
8. How to switch between live AI and mock mode.
9. How to monitor Vercel and Gemini usage.

Prepare everything for deployment, but leave the initial Vercel project creation and production deployment to the project owner.

Do not attempt to modify existing Vercel projects.

Do not claim that a production deployment succeeded unless it has actually been completed and verified.

## 20. Cross-agent compatibility and development continuity

Ensure that another AI coding agent, such as Claude Code, can resume development at any point without access to the original Codex conversation.

- Save the complete project specification in SPEC.md.
- Maintain an up-to-date PROGRESS.md documenting completed tasks, remaining tasks, blockers, and next steps.
- Create both AGENTS.md and CLAUDE.md containing consistent repository-specific engineering guidance.
- Document architectural decisions and the purpose of major components.
- Commit code at logical implementation milestones.
- Push validated commits to the NextStep GitHub repository when permissions allow.
- Record test results and known bugs.
- Keep setup, testing, and deployment instructions current.
- Avoid unnecessary dependencies on Codex-specific functionality.
- Update the progress file throughout development rather than waiting until the final milestone.

Another engineer or AI coding agent should be able to inspect the repository and resume development without requiring additional explanations from the project owner.

If execution limits become constrained, prioritize preserving working code and documenting the exact next steps.

## 21. Implementation milestones

Execute these milestones without waiting for approval between them.

### Phase 1 — Foundation

1. Inspect the repository and verify the GitHub connection.
2. Establish the project architecture.
3. Save the project specification and establish progress tracking.
4. Define product requirements, acceptance tests, and initial evaluation cases.
5. Initialize the website and design system.
6. Commit and push the initial foundation.

### Phase 2 — Core working prototype

7. Build onboarding, dashboard, profile management, and sample profiles.
8. Build the activity library and deterministic recommendation constraints.
9. Implement the mock recommendation engine.
10. Implement Gemini integration and structured output validation.
11. Implement the feedback loop and adaptive recommendations.
12. Verify the complete end-to-end caregiver experience.
13. Commit and push the functional core prototype.

### Phase 3 — Supporting functionality

14. Build activity history and settings.
15. Implement guardrails, error handling, and demo fallback behavior.
16. Implement prototype metrics and insights.
17. Add secondary features where time and resources permit.
18. Commit and push validated supporting functionality.

Safety constraints must be implemented before exposing any live AI behavior, not postponed until the end of development.

### Phase 4 — Testing and refinement

19. Run unit tests, integration tests, and end-to-end tests.
20. Run available AI evaluations and investigate failures.
21. Review desktop and mobile layouts and improve usability.
22. Inspect rendered pages for visual inconsistencies and broken interactions.
23. Resolve identified bugs and rerun relevant tests.
24. Commit and push tested improvements.

### Phase 5 — Delivery

25. Prepare Vercel deployment configuration and documentation.
26. Prepare presentation documentation and prototype evidence.
27. Perform a final review against the acceptance criteria.
28. Document remaining manual steps and blockers.
29. Commit and push the final validated implementation.
30. Confirm GitHub synchronization and provide final project status.

If a milestone encounters an external blocker, document it and continue with all remaining independent work.

Prioritize a functioning end-to-end recommendation and feedback loop before secondary features.

If development resources or execution limits become constrained, preserve a working core experience rather than leaving multiple incomplete features.

## 22. Development priorities

If scope, time, or usage constraints require prioritization, use the following order.

### P0 — Essential

- Functional onboarding and fictional profiles
- Grounded activity library
- Personalized recommendations
- Gemini API integration
- Caregiver feedback
- Adaptive subsequent recommendations
- Safety and eligibility constraints
- Local persistence
- Working mock mode
- Basic evaluations
- Successful production build
- GitHub synchronization

### P1 — Important

- Polished landing page
- Responsive design
- Activity history
- Profile management
- Evaluation reporting
- Presentation demonstration
- Vercel deployment readiness
- Cross-agent handoff documentation

### P2 — Optional enhancements

- Simulated caregiver-role switching
- Advanced visualizations
- Additional demonstration profiles
- Expanded activity library
- Additional animation and visual refinement
- More elaborate developer insights dashboard

Complete P0 before investing substantial resources in P2.

Do not sacrifice the working AI experience to add unnecessary features.

## 23. Definition of done

The project is complete when:

- The application installs and runs successfully.
- The production build completes without errors.
- The core onboarding-to-recommendation-to-feedback loop is functional.
- Recommendations persist appropriately across browser refreshes.
- Previous feedback is incorporated into updated recommendations.
- The live AI integration is implemented and independently testable.
- Mock and live behaviors are clearly distinguished.
- Safety and grounding checks are implemented.
- Evaluation cases are executable and available results are documented.
- Key user journeys have been tested.
- Desktop and mobile experiences are usable.
- The visual experience is polished and consistent.
- Vercel deployment configuration and instructions are complete.
- The presentation demonstration can be repeated.
- No paid services are required.
- Another coding agent can resume development using repository documentation.
- Validated code is committed and synchronized with GitHub where authentication permits.
- Remaining limitations are disclosed honestly.

Do not consider the project complete merely because the application compiles.

Continue implementing, testing, debugging, reviewing, and refining until the deliverables are satisfied or genuine blockers have been documented.

At the end, provide a concise summary of:

- Completed functionality
- Tests performed
- Actual evaluation results
- Known limitations
- Outstanding issues
- GitHub synchronization status
- Commands required to run the website locally
- Instructions for activating Gemini
- Vercel deployment steps
- Any remaining actions requiring human involvement

Explicitly distinguish a completed mock-mode implementation from a live AI prototype that has been tested using actual Gemini API requests.

Begin development now.