import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Card,
  Group,
  Avatar,
  Badge,
  Text,
  Stack,
  Grid,
  Title,
  Loader,
  Center,
  Progress,
  Tabs,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconChartBar } from "@tabler/icons-react";
import { candidateService, promptService } from "../services/api";

const formatPhone = (value) => {
  if (!value) return "";
  const hasPlus = String(value).trim().startsWith("+");
  const digits = String(value).replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  return hasPlus ? `+${digits}` : digits;
};

const phoneHref = (value) => {
  const formatted = formatPhone(value);
  return formatted ? `tel:${formatted}` : "";
};

export function SharedProfile() {
  const { token } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [prompts, setPrompts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedProfile();
    loadPrompts();
  }, [token]);

  const loadSharedProfile = async () => {
    try {
      const response = await candidateService.getSharedCandidate(token);
      setCandidate(response.data);
    } catch (err) {
      setError("Profile not found or access denied");
      console.error("Failed to load shared profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const response = await promptService.getAllPrompts();
      const promptMap = {};
      response.data.forEach((p) => {
        promptMap[p.id] = p;
      });
      setPrompts(promptMap);
    } catch (err) {
      console.error("Failed to load prompts:", err);
    }
  };

  if (loading) {
    return (
      <Center py="xl" mih="100vh">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py="xl" mih="100vh">
        <Alert icon={<IconAlertCircle />} color="red" title="Error">
          {error}
        </Alert>
      </Center>
    );
  }

  if (!candidate) {
    return (
      <Center py="xl" mih="100vh">
        <Text c="dimmed">No candidate data found</Text>
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        {/* Header */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group gap="lg">
            <Avatar
              src={candidate.avatar_url}
              size={100}
              radius="md"
              name={`${candidate.first_name} ${candidate.last_name}`}
            />
            <div style={{ flex: 1 }}>
              <Title order={2}>
                {candidate.first_name} {candidate.last_name}
              </Title>
              <Group gap="sm" mb="md">
                <Badge size="lg" color="blue">
                  {candidate.primary_skill}
                </Badge>
                {candidate.ranking && (
                  <Badge size="lg" color="gold">
                    Rank #{candidate.ranking.rank}
                  </Badge>
                )}
              </Group>
              <Group gap="md">
                {candidate.location && (
                  <Text size="sm">📍 {candidate.location}</Text>
                )}
                {candidate.years_experience && (
                  <Text size="sm">💼 {candidate.years_experience} years</Text>
                )}
              </Group>
            </div>
          </Group>

          {candidate.bio && (
            <Card.Section
              inheritPadding
              py="md"
              mt="md"
              style={{ borderTop: "1px solid #e9ecef" }}
            >
              <Text size="sm">{candidate.bio}</Text>
            </Card.Section>
          )}
        </Card>

        {/* Overall Scores */}
        {candidate.ranking && (
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    Overall Score
                  </Text>
                  <Text size="lg" fw={700} c="blue">
                    {candidate.ranking.overall_score.toFixed(1)}
                  </Text>
                </Group>
                <Progress
                  value={(candidate.ranking.overall_score / 100) * 100}
                  size="lg"
                />
              </Card>
            </Grid.Col>

            {candidate.ranking.crisis_score && (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>
                      Crisis
                    </Text>
                    <Text size="lg" fw={700} c="red">
                      {candidate.ranking.crisis_score.toFixed(1)}
                    </Text>
                  </Group>
                  <Progress
                    value={(candidate.ranking.crisis_score / 100) * 100}
                    size="lg"
                    color="red"
                  />
                </Card>
              </Grid.Col>
            )}

            {candidate.ranking.sustainability_score && (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>
                      Sustainability
                    </Text>
                    <Text size="lg" fw={700} c="teal">
                      {candidate.ranking.sustainability_score.toFixed(1)}
                    </Text>
                  </Group>
                  <Progress
                    value={(candidate.ranking.sustainability_score / 100) * 100}
                    size="lg"
                    color="teal"
                  />
                </Card>
              </Grid.Col>
            )}

            {candidate.ranking.team_score && (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>
                      Team Building
                    </Text>
                    <Text size="lg" fw={700} c="orange">
                      {candidate.ranking.team_score.toFixed(1)}
                    </Text>
                  </Group>
                  <Progress
                    value={(candidate.ranking.team_score / 100) * 100}
                    size="lg"
                    color="orange"
                  />
                </Card>
              </Grid.Col>
            )}
          </Grid>
        )}

        {/* Skills */}
        {candidate.secondary_skills &&
          candidate.secondary_skills.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Secondary Skills
              </Title>
              <Group gap="sm">
                {candidate.secondary_skills.map((skill, idx) => (
                  <Badge key={idx} size="md" variant="outline">
                    {skill}
                  </Badge>
                ))}
              </Group>
            </Card>
          )}

        {/* Evaluations */}
        {candidate.evaluations && candidate.evaluations.length > 0 && (
          <Tabs variant="pills">
            <Tabs.List>
              {candidate.evaluations.map((evaluate) => (
                <Tabs.Tab
                  key={evaluate.id}
                  value={evaluate.prompt_type}
                  leftSection={<IconChartBar size={14} />}
                  tt="capitalize"
                >
                  {evaluate.prompt_type}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {candidate.evaluations.map((evaluate) => (
              <Tabs.Panel
                key={evaluate.id}
                value={evaluate.prompt_type}
                py="xl"
              >
                <Stack spacing="lg">
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Score: {evaluate.total_score.toFixed(1)}
                    </Title>
                    <Grid>
                      {Object.entries(evaluate.rubric_scores).map(
                        ([key, score]) => {
                          const maxScore =
                            prompts[evaluate.prompt_type]?.rubric[key]
                              ?.maxScore || 100;
                          const categoryName =
                            prompts[evaluate.prompt_type]?.rubric[key]?.name ||
                            key;
                          return (
                            <Grid.Col key={key} span={{ base: 12, sm: 6 }}>
                              <Stack spacing="xs">
                                <Group justify="space-between">
                                  <Text fw={500} size="sm">
                                    {categoryName}
                                  </Text>
                                  <Text fw={700} size="sm">
                                    {score.toFixed(1)}/{maxScore}
                                  </Text>
                                </Group>
                                <Progress
                                  value={(score / maxScore) * 100}
                                  size="md"
                                />
                              </Stack>
                            </Grid.Col>
                          );
                        },
                      )}
                    </Grid>
                  </Card>

                  {evaluate.response && (
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Title order={4} mb="md">
                        Response
                      </Title>
                      <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                        {evaluate.response}
                      </Text>
                    </Card>
                  )}
                </Stack>
              </Tabs.Panel>
            ))}
          </Tabs>
        )}

        {/* Contact Info */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Contact & Links
          </Title>
          <Stack spacing="sm">
            {candidate.email && (
              <Group gap="sm">
                <Text size="sm" fw={500}>
                  📧 Email:
                </Text>
                <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
              </Group>
            )}
            {candidate.phone && formatPhone(candidate.phone) && (
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  ☎️ Phone:
                </Text>
                <a href={phoneHref(candidate.phone)}>
                  {formatPhone(candidate.phone)}
                </a>
              </Group>
            )}
            {candidate.linkedin_url && (
              <Group gap="sm">
                <Text size="sm" fw={500}>
                  💼 LinkedIn:
                </Text>
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Profile
                </a>
              </Group>
            )}
            {candidate.github_url && (
              <Group gap="sm">
                <Text size="sm" fw={500}>
                  💻 GitHub:
                </Text>
                <a
                  href={candidate.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Profile
                </a>
              </Group>
            )}
            {candidate.website_url && (
              <Group gap="sm">
                <Text size="sm" fw={500}>
                  🌐 Website:
                </Text>
                <a
                  href={candidate.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Site
                </a>
              </Group>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
