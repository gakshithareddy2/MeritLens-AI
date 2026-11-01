# MeritLens AI — Fixes in this package

## Student goals and study tasks
- New goals are created with Active status and 0% progress.
- The entered estimated duration is saved and displayed, including in the weekly plan and AI prompt.
- Goal cards expose both Mark as Done/Reopen Goal and Explain with AI actions.
- Completion status and progress are kept consistent by the API; students can only update their own goals.
- Student dashboard, progress, and study-task views refresh after local updates, on focus, and every 30 seconds to pick up teacher-side changes.

## Student dashboard and teacher marks
- Current marks are derived from the average of the student's latest subject marks.
- Performance category (Distinction/Merit/Pass/At Risk) is based on actual current marks, not the predicted score.
- Expected marks remain a separate ML prediction and are recalculated when teachers update student marks, attendance, assignments, or study hours.
- Dashboard and teacher views receive the normalized current score and actual-mark category.
- Zero values for marks, attendance, assignments, and study hours are preserved rather than replaced by defaults.

## Dynamic classes and subjects
- Teachers can add custom classes in Settings > Class Cohort Catalogue.
- Student create/edit forms and class filters use the saved class catalogue.
- Teachers can add custom subjects in Settings > Subject Catalogue; the existing student record subject list is updated and derived marks/predictions are recalculated.
- A custom class cannot be deleted while students are assigned to it.

## Run
1. Extract the ZIP and open the folder containing `package.json` in VS Code.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The previous prebuilt `dist` directory was omitted so the app cannot accidentally serve an outdated frontend bundle. Run `npm run build` before deploying in production.

## Verification note
The source changes were reviewed for TypeScript/JSX syntax. A full build and automated tests could not be completed in this environment because project dependencies were not installed; run `npm install`, `npm run build`, and `npm test` locally and share any error output for follow-up.
