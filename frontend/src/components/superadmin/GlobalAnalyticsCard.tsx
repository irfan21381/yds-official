import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AnalyticsData {
  totalColleges?: number;
  totalUsers?: number;
  totalTeachers?: number;
  totalStudents?: number;
  totalMaterials?: number;
  totalQuizzes?: number;
  totalQuizAttempts?: number;
  aiUsage?: {
    totalQueries?: number;
    totalEmbeddings?: number;
  };
}

interface GlobalAnalyticsCardProps {
  analytics: AnalyticsData | null;
  loadingAnalytics: boolean;
}

const GlobalAnalyticsCard: React.FC<GlobalAnalyticsCardProps> = ({ analytics, loadingAnalytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Analytics</CardTitle>
        <CardDescription>Overview of the entire YDS EDUAI platform.</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingAnalytics ? (
          <div className="col-span-full text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            <StatCard title="Total Colleges" value={analytics.totalColleges ?? 0} />
            <StatCard title="Total Users" value={analytics.totalUsers ?? 0} />
            <StatCard title="Total Teachers" value={analytics.totalTeachers ?? 0} />
            <StatCard title="Total Students" value={analytics.totalStudents ?? 0} />
            <StatCard title="Approved Materials" value={analytics.totalMaterials ?? 0} />
            <StatCard title="Total Quizzes" value={analytics.totalQuizzes ?? 0} />
            <StatCard title="Total Quiz Attempts" value={analytics.totalQuizAttempts ?? 0} />

            {/* SAFE AI Usage */}
            <StatCard
              title="AI Queries"
              value={analytics.aiUsage?.totalQueries ?? 0}
            />
            <StatCard
              title="AI Embeddings"
              value={analytics.aiUsage?.totalEmbeddings ?? 0}
            />
          </>
        ) : (
          <p className="col-span-full text-center">
            No analytics data available.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="p-4 border rounded-md">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-2xl">{value}</p>
  </div>
);

export default GlobalAnalyticsCard;
