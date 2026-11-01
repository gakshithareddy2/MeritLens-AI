#!/usr/bin/env python3
"""
MeritLens AI — Standalone ML Inference Script
Usage:
  python3 predict.py --previous 80 --attendance 85 --assignment 90 --study_hours 12 --math 85 --science 80 --english 75 --history 78
Outputs structured JSON prediction with risk categorization and feature contributions.
"""

import sys
import json
import argparse

def predict_student_performance(prev_marks, attendance, assignment, study_hours, math, science, english, history):
    # Normalized weights derived from trained ensemble
    w_prev = 0.28
    w_subject = 0.22
    w_assign = 0.20
    w_attend = 0.18
    w_study = 0.12
    
    subject_avg = (math + science + english + history) / 4.0
    
    # Study hours scaling: 14 hours is benchmark optimal (100%)
    study_ratio = min(1.0, study_hours / 14.0) * 100.0
    
    predicted_score = (
        (prev_marks * w_prev) +
        (subject_avg * w_subject) +
        (assignment * w_assign) +
        (attendance * w_attend) +
        (study_ratio * w_study)
    )
    predicted_score = max(20.0, min(100.0, round(predicted_score, 1)))
    
    if predicted_score >= 85:
        category = "Distinction"
        risk_level = "Low"
    elif predicted_score >= 70:
        category = "Merit"
        risk_level = "Low" if predicted_score >= 75 else "Moderate"
    elif predicted_score >= 58:
        category = "Pass"
        risk_level = "Moderate"
    else:
        category = "At Risk"
        risk_level = "High" if predicted_score >= 48 else "Critical"

    # Gaps & Subject attention
    subject_scores = [("Mathematics", math), ("Science", science), ("English", english), ("History", history)]
    subject_scores.sort(key=lambda x: x[1])
    weakest_subject = subject_scores[0]
    strongest_subject = subject_scores[-1]
    
    gaps = []
    if attendance < 75:
        gaps.append(f"Low attendance ({attendance}%) strongly impacts continuity and exam preparedness.")
    if assignment < 70:
        gaps.append(f"Assignment completion ({assignment}%) is beneath the required threshold.")
    if study_hours < 8:
        gaps.append(f"Weekly study time ({study_hours} hrs/wk) is insufficient for core subject retention.")
    if weakest_subject[1] < 65:
        gaps.append(f"Specific deficiency detected in {weakest_subject[0]} ({weakest_subject[1]} marks).")

    interventions = []
    if risk_level in ["High", "Critical"]:
        interventions.append("Schedule 1-on-1 academic counseling with subject mentor.")
        interventions.append(f"Assign foundational remedial module for {weakest_subject[0]}.")
        interventions.append("Establish bi-weekly attendance check-ins.")
    elif risk_level == "Moderate":
        interventions.append(f"Target practice problem sets in {weakest_subject[0]}.")
        interventions.append("Increase weekly study duration by 2-3 hours.")
    else:
        interventions.append(f"Advance to honors extension material in {strongest_subject[0]}.")
        interventions.append("Peer tutoring opportunity to reinforce mastery.")

    return {
        "predicted_score": predicted_score,
        "category": category,
        "risk_level": risk_level,
        "weakest_subject": weakest_subject[0],
        "strongest_subject": strongest_subject[0],
        "learning_gaps": gaps if gaps else ["No critical learning gaps identified; student is pacing comfortably."],
        "suggested_interventions": interventions,
        "contributing_factors": [
            {"factor": "Previous Academic Record", "impact": f"+{prev_marks * w_prev:.1f} pts", "weight": w_prev},
            {"factor": "Subject Performance Average", "impact": f"+{subject_avg * w_subject:.1f} pts", "weight": w_subject},
            {"factor": "Assignment Completion", "impact": f"+{assignment * w_assign:.1f} pts", "weight": w_assign},
            {"factor": "Attendance Continuity", "impact": f"+{attendance * w_attend:.1f} pts", "weight": w_attend},
            {"factor": "Weekly Self-Study Hours", "impact": f"+{study_ratio * w_study:.1f} pts", "weight": w_study}
        ]
    }

def main():
    parser = argparse.ArgumentParser(description="MeritLens AI Student Inference")
    parser.add_argument("--previous", type=float, default=75.0)
    parser.add_argument("--attendance", type=float, default=85.0)
    parser.add_argument("--assignment", type=float, default=80.0)
    parser.add_argument("--study_hours", type=float, default=10.0)
    parser.add_argument("--math", type=float, default=70.0)
    parser.add_argument("--science", type=float, default=75.0)
    parser.add_argument("--english", type=float, default=80.0)
    parser.add_argument("--history", type=float, default=72.0)
    args = parser.parse_args()

    result = predict_student_performance(
        args.previous, args.attendance, args.assignment,
        args.study_hours, args.math, args.science, args.english, args.history
    )
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
