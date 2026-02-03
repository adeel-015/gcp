import { useEffect, useState } from "react";
import {
  Title,
  Grid,
  Card,
  Text,
  Badge,
  Group,
  Center,
  Loader,
  Stack,
  RingProgress,
  Progress,
} from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { analyticsService } from "../services/api";

export function SkillHeatmap() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState([]);

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const skillsRes = await analyticsService.getSkillDistribution();
      const evalRes = await analyticsService.getEvaluationMetrics();

      setSkills(skillsRes.data);
      setEvaluations(evalRes.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  const topSkills = skills.slice(0, 12);
  const totalCandidates = skills.reduce(
    (sum, s) => sum + toNumber(s.count, 0),
    0,
  );

  return (
    <Stack spacing="lg">
      <div>
        <Title order={2}>📊 Skills Distribution & Performance</Title>
        <Text c="dimmed" size="sm">
          Candidate concentration and evaluation scores by primary skill
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section inheritPadding py="md">
              <Title order={4}>Skills Distribution</Title>
            </Card.Section>
            <Card.Section>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSkills}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="skill"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                    }}
                  />
                  <Bar dataKey="count" fill="#4C6EF5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Section>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section inheritPadding py="md">
              <Title order={4}>Performance by Skill</Title>
            </Card.Section>
            <Card.Section>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSkills}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="skill"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                    }}
                    formatter={(value) => toNumber(value).toFixed(1)}
                  />
                  <Bar
                    dataKey="avg_score"
                    fill="#15aabf"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card.Section>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        {topSkills.map((skill) => (
          <Grid.Col key={skill.skill} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack spacing="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500} size="sm">
                      {skill.skill}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {toNumber(skill.count, 0)} candidates
                    </Text>
                  </div>
                  <RingProgress
                    sections={[
                      {
                        value:
                          totalCandidates > 0
                            ? (toNumber(skill.count, 0) / totalCandidates) * 100
                            : 0,
                        color: "#4C6EF5",
                      },
                    ]}
                    size={60}
                    thickness={4}
                    label={
                      <div style={{ textAlign: "center" }}>
                        <Text size="xs" fw={700}>
                          {totalCandidates > 0
                            ? (
                                (toNumber(skill.count, 0) / totalCandidates) *
                                100
                              ).toFixed(0)
                            : "0"}
                          %
                        </Text>
                      </div>
                    }
                  />
                </Group>

                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" fw={500}>
                      Avg Score
                    </Text>
                    <Text size="xs" fw={700}>
                      {toNumber(skill.avg_score, 0).toFixed(1)}
                    </Text>
                  </Group>
                  <Progress
                    value={(toNumber(skill.avg_score, 0) / 100) * 100}
                    size="sm"
                    color={
                      toNumber(skill.avg_score, 0) >= 70
                        ? "green"
                        : toNumber(skill.avg_score, 0) >= 50
                          ? "yellow"
                          : "red"
                    }
                  />
                </div>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section inheritPadding py="md">
          <Title order={4}>Evaluation Metrics by Prompt</Title>
        </Card.Section>
        <Grid>
          {evaluations.map((evaluate) => (
            <Grid.Col
              key={evaluate.prompt_type}
              span={{ base: 12, sm: 6, md: 4 }}
            >
              <Stack spacing="sm">
                <Group justify="space-between">
                  <Text fw={500} size="sm" tt="capitalize">
                    {evaluate.prompt_type} Evaluations
                  </Text>
                  <Badge size="lg">{evaluate.count}</Badge>
                </Group>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="xs">Average</Text>
                    <Text size="xs" fw={700}>
                      {toNumber(evaluate.avg_score, 0).toFixed(1)}
                    </Text>
                  </Group>
                  <Progress
                    value={
                      (toNumber(evaluate.avg_score, 0) /
                        toNumber(evaluate.max_possible, 100)) *
                      100
                    }
                    size="sm"
                  />
                </div>
                <Group gap="xs" justify="space-between">
                  <Text size="xs" c="dimmed">
                    Min: {toNumber(evaluate.min_score, 0).toFixed(1)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Max: {toNumber(evaluate.max_score, 0).toFixed(1)}
                  </Text>
                </Group>
              </Stack>
            </Grid.Col>
          ))}
        </Grid>
      </Card>
    </Stack>
  );
}
