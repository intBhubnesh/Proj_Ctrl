/*
  Warnings:

  - You are about to drop the column `rubric` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Faculty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Technology` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProjectDetailToTechnology` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudentToTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserTeam` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[submissionId]` on the table `Assessment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leaderUserId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latestAssessmentId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[enrollmentNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mentorUserId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaderUserId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."TeamMemberRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING_CHECK', 'CHECKING', 'CLEAN', 'FLAGGED', 'RESUBMIT_REQUIRED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "public"."PlagiarismStatus" AS ENUM ('CLEAN', 'SUSPICIOUS', 'PLAGIARIZED');

-- CreateEnum
CREATE TYPE "public"."AssessmentStatus" AS ENUM ('NOT_ASSESSED', 'IN_REVIEW', 'GRADED', 'LOCKED');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."ContributionValidationStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."AssessmentAssignment" DROP CONSTRAINT "AssessmentAssignment_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AssessmentAssignment" DROP CONSTRAINT "AssessmentAssignment_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AssessmentAssignment" DROP CONSTRAINT "AssessmentAssignment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AssessmentResult" DROP CONSTRAINT "AssessmentResult_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Faculty" DROP CONSTRAINT "Faculty_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectDetail" DROP CONSTRAINT "ProjectDetail_domainId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectDetail" DROP CONSTRAINT "ProjectDetail_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProjectDetailToTechnology" DROP CONSTRAINT "_ProjectDetailToTechnology_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProjectDetailToTechnology" DROP CONSTRAINT "_ProjectDetailToTechnology_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudentToTeam" DROP CONSTRAINT "_StudentToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudentToTeam" DROP CONSTRAINT "_StudentToTeam_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserTeam" DROP CONSTRAINT "_UserTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserTeam" DROP CONSTRAINT "_UserTeam_B_fkey";

-- AlterTable
ALTER TABLE "public"."Assessment" DROP COLUMN "rubric",
DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mentorUserId" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "rubricJson" JSONB,
ADD COLUMN     "status" "public"."AssessmentStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
ADD COLUMN     "submissionId" TEXT,
ADD COLUMN     "totalMarks" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Team" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentMentorId" TEXT,
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "latestAssessmentId" TEXT,
ADD COLUMN     "leaderUserId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "collegeEmail" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enrollmentNo" TEXT,
ADD COLUMN     "externalSyncStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL;

-- DropTable
DROP TABLE "public"."Announcement";

-- DropTable
DROP TABLE "public"."AssessmentAssignment";

-- DropTable
DROP TABLE "public"."AssessmentResult";

-- DropTable
DROP TABLE "public"."Domain";

-- DropTable
DROP TABLE "public"."Faculty";

-- DropTable
DROP TABLE "public"."ProjectDetail";

-- DropTable
DROP TABLE "public"."Report";

-- DropTable
DROP TABLE "public"."Student";

-- DropTable
DROP TABLE "public"."Technology";

-- DropTable
DROP TABLE "public"."_ProjectDetailToTechnology";

-- DropTable
DROP TABLE "public"."_StudentToTeam";

-- DropTable
DROP TABLE "public"."_UserTeam";

-- DropEnum
DROP TYPE "public"."ProjectStatus";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "semester" INTEGER,
    "division" TEXT,
    "institution" TEXT,
    "course" TEXT,
    "currentTeamId" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expertise" TEXT,
    "technologies" TEXT,
    "department" TEXT,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "role" "public"."TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "memberDeclaredRole" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMentorAssignment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "mentorUserId" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "TeamMentorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "repoUrl" TEXT,
    "srsReportId" TEXT,
    "pptUrl" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storageUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT,
    "uploadedByUserId" TEXT NOT NULL,

    CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "submittedByUserId" TEXT NOT NULL,
    "attemptNo" INTEGER NOT NULL,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING_CHECK',
    "reportFileId" TEXT,
    "repoUrl" TEXT,
    "notes" TEXT,
    "uniqueContribution" TEXT,
    "contributionStatus" "public"."ContributionValidationStatus" NOT NULL DEFAULT 'NOT_REQUIRED',

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlagiarismReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" TEXT NOT NULL,
    "similarityPct" DOUBLE PRECISION NOT NULL,
    "status" "public"."PlagiarismStatus" NOT NULL,
    "reasonsJson" JSONB,
    "modelVersion" TEXT,
    "datasetTag" TEXT,
    "summary" TEXT,

    CONSTRAINT "PlagiarismReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeeklyReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrls" TEXT[],

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "templateKey" TEXT,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailJob" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "filterJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',

    CONSTRAINT "EmailJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailJobRecipient" (
    "id" TEXT NOT NULL,
    "emailJobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,

    CONSTRAINT "EmailJobRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalSyncLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "erpNumber" TEXT NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "ExternalSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseDoc" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseDoc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "public"."StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_currentTeamId_key" ON "public"."StudentProfile"("currentTeamId");

-- CreateIndex
CREATE INDEX "StudentProfile_department_idx" ON "public"."StudentProfile"("department");

-- CreateIndex
CREATE INDEX "StudentProfile_currentTeamId_idx" ON "public"."StudentProfile"("currentTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "public"."TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "public"."AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "TeamMembership_studentProfileId_idx" ON "public"."TeamMembership"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_studentProfileId_joinedAt_key" ON "public"."TeamMembership"("teamId", "studentProfileId", "joinedAt");

-- CreateIndex
CREATE INDEX "TeamMentorAssignment_mentorUserId_idx" ON "public"."TeamMentorAssignment"("mentorUserId");

-- CreateIndex
CREATE INDEX "TeamMentorAssignment_teamId_assignedAt_idx" ON "public"."TeamMentorAssignment"("teamId", "assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_teamId_key" ON "public"."Project"("teamId");

-- CreateIndex
CREATE INDEX "Project_domain_idx" ON "public"."Project"("domain");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "public"."Submission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_projectId_attemptNo_key" ON "public"."Submission"("projectId", "attemptNo");

-- CreateIndex
CREATE UNIQUE INDEX "PlagiarismReport_submissionId_key" ON "public"."PlagiarismReport"("submissionId");

-- CreateIndex
CREATE INDEX "WeeklyReport_authorUserId_idx" ON "public"."WeeklyReport"("authorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_teamId_weekLabel_key" ON "public"."WeeklyReport"("teamId", "weekLabel");

-- CreateIndex
CREATE INDEX "UserNotification_readAt_idx" ON "public"."UserNotification"("readAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_userId_notificationId_key" ON "public"."UserNotification"("userId", "notificationId");

-- CreateIndex
CREATE INDEX "EmailJobRecipient_status_idx" ON "public"."EmailJobRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailJobRecipient_emailJobId_userId_key" ON "public"."EmailJobRecipient"("emailJobId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_token_idx" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_idx" ON "public"."VerificationToken"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ExternalSyncLog_userId_createdAt_idx" ON "public"."ExternalSyncLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExternalSyncLog_erpNumber_idx" ON "public"."ExternalSyncLog"("erpNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_submissionId_key" ON "public"."Assessment"("submissionId");

-- CreateIndex
CREATE INDEX "Assessment_mentorUserId_idx" ON "public"."Assessment"("mentorUserId");

-- CreateIndex
CREATE INDEX "Assessment_projectId_idx" ON "public"."Assessment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_code_key" ON "public"."Team"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Team_leaderUserId_key" ON "public"."Team"("leaderUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_latestAssessmentId_key" ON "public"."Team"("latestAssessmentId");

-- CreateIndex
CREATE INDEX "Team_currentMentorId_idx" ON "public"."Team"("currentMentorId");

-- CreateIndex
CREATE INDEX "Team_department_idx" ON "public"."Team"("department");

-- CreateIndex
CREATE UNIQUE INDEX "User_enrollmentNo_key" ON "public"."User"("enrollmentNo");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_currentTeamId_fkey" FOREIGN KEY ("currentTeamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_currentMentorId_fkey" FOREIGN KEY ("currentMentorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_latestAssessmentId_fkey" FOREIGN KEY ("latestAssessmentId") REFERENCES "public"."Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMembership" ADD CONSTRAINT "TeamMembership_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMentorAssignment" ADD CONSTRAINT "TeamMentorAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMentorAssignment" ADD CONSTRAINT "TeamMentorAssignment_mentorUserId_fkey" FOREIGN KEY ("mentorUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMentorAssignment" ADD CONSTRAINT "TeamMentorAssignment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_srsReportId_fkey" FOREIGN KEY ("srsReportId") REFERENCES "public"."ProjectFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectFile" ADD CONSTRAINT "ProjectFile_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_reportFileId_fkey" FOREIGN KEY ("reportFileId") REFERENCES "public"."ProjectFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlagiarismReport" ADD CONSTRAINT "PlagiarismReport_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_mentorUserId_fkey" FOREIGN KEY ("mentorUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyReport" ADD CONSTRAINT "WeeklyReport_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyReport" ADD CONSTRAINT "WeeklyReport_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNotification" ADD CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailJob" ADD CONSTRAINT "EmailJob_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailJobRecipient" ADD CONSTRAINT "EmailJobRecipient_emailJobId_fkey" FOREIGN KEY ("emailJobId") REFERENCES "public"."EmailJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailJobRecipient" ADD CONSTRAINT "EmailJobRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalSyncLog" ADD CONSTRAINT "ExternalSyncLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
