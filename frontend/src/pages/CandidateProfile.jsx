import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Avatar,
  Stack,
  Card,
  Progress,
  Button,
  Loader,
  Center,
  Grid,
  ActionIcon,
  Tooltip,
  CopyButton,
  Modal,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconMapPin,
  IconShare2,
  IconCheck,
  IconLink,
} from "@tabler/icons-react";
import { candidateService } from "../services/api";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatScore = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : "N/A";
};

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

export function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    setLoading(true);
    try {
      const response = await candidateService.getCandidateById(id);
      setCandidate(response.data);
    } catch (error) {
      console.error("Failed to load candidate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const response = await candidateService.shareCandidateProfile(id);
      setShareUrl(response.data.shareUrl);
      setShareModalOpen(true);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center py="xl">
          <Loader />
        </Center>
      </Container>
    );
  }

  if (!candidate) {
    return (
      <Container size="xl" py="xl">
        <Center py="xl">
          <Text>Candidate not found</Text>
        </Center>
      </Container>
    );
  }

  return (
    <>
      <Container size="xl" py="xl">
        <Stack spacing="xl">
          <Button
            component={Link}
            to="/"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            size="sm"
          >
            Back to Dashboard
          </Button>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
              <Group gap="xl">
                <Avatar
                  src={candidate.avatar_url}
                  size={120}
                  radius="md"
                  name={`${candidate.first_name} ${candidate.last_name}`}
                />
                <div>
                  <Title order={2}>
                    {candidate.first_name} {candidate.last_name}
                  </Title>
                  <Text size="lg" c="dimmed" mt="xs">
                    {candidate.email}
                  </Text>
                  {candidate.ranking && (
                    <Group gap="md" mt="sm">
                      <Badge size="lg" color="blue">
                        Rank #{toNumber(candidate.ranking.rank, 0)}
                      </Badge>
                      <Badge size="lg" color="green" variant="light">
                        {formatScore(candidate.ranking.overall_score)} / 100
                      </Badge>
                    </Group>
                  )}
                </div>
              </Group>

              <Button
                leftSection={<IconShare2 size={16} />}
                onClick={handleShare}
                loading={sharing}
                variant="light"
              >
                Share Profile
              </Button>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack spacing="md">
                  <div>
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Primary Skill
                    </Text>
                    <Badge size="lg" variant="light">
                      {candidate.primary_skill}
                    </Badge>
                  </div>

                  {candidate.secondary_skills &&
                    candidate.secondary_skills.length > 0 && (
                      <div>
                        <Text size="sm" fw={600} c="dimmed" mb="xs">
                          Secondary Skills
                        </Text>
                        <Group gap="xs">
                          {candidate.secondary_skills.map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </Group>
                      </div>
                    )}

                  {candidate.location && (
                    <Group gap="xs" align="center">
                      <IconMapPin size={20} stroke={1.5} />
                      <Text size="md">{candidate.location}</Text>
                    </Group>
                  )}

                  {candidate.years_experience && (
                    <Text size="md">
                      💼 {candidate.years_experience} years of experience
                    </Text>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack spacing="md">
                  <div>
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Contact & Links
                    </Text>
                    <Group gap="md">
                      {candidate.linkedin_url && (
                        <Tooltip label="LinkedIn Profile">
                          <ActionIcon
                            variant="light"
                            component="a"
                            href={candidate.linkedin_url}
                            target="_blank"
                            size="xl"
                          >
                            💼
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {candidate.github_url && (
                        <Tooltip label="GitHub Profile">
                          <ActionIcon
                            variant="light"
                            component="a"
                            href={candidate.github_url}
                            target="_blank"
                            size="xl"
                          >
                            💻
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {candidate.website_url && (
                        <Tooltip label="Website">
                          <ActionIcon
                            variant="light"
                            component="a"
                            href={candidate.website_url}
                            target="_blank"
                            size="xl"
                          >
                            🌐
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {candidate.phone && formatPhone(candidate.phone) && (
                        <Tooltip label={formatPhone(candidate.phone)}>
                          <ActionIcon
                            variant="light"
                            component="a"
                            href={phoneHref(candidate.phone)}
                            size="xl"
                          >
                            ☎️
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </div>
                </Stack>
              </Grid.Col>
            </Grid>

            {candidate.bio && (
              <div style={{ marginTop: "2rem" }}>
                <Text size="sm" fw={600} c="dimmed" mb="xs">
                  About
                </Text>
                <Text>{candidate.bio}</Text>
              </div>
            )}
          </Card>

          {candidate.ranking && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Performance Scores
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        Crisis Management
                      </Text>
                      <Text size="sm" fw={700}>
                        {formatScore(candidate.ranking.crisis_score)}
                      </Text>
                    </Group>
                    <Progress
                      value={
                        (toNumber(candidate.ranking.crisis_score, 0) / 100) *
                        100
                      }
                      size="lg"
                      color="red"
                    />
                  </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        Sustainability
                      </Text>
                      <Text size="sm" fw={700}>
                        {formatScore(candidate.ranking.sustainability_score)}
                      </Text>
                    </Group>
                    <Progress
                      value={
                        (toNumber(candidate.ranking.sustainability_score, 0) /
                          100) *
                        100
                      }
                      size="lg"
                      color="teal"
                    />
                  </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        Team Building
                      </Text>
                      <Text size="sm" fw={700}>
                        {formatScore(candidate.ranking.team_score)}
                      </Text>
                    </Group>
                    <Progress
                      value={
                        (toNumber(candidate.ranking.team_score, 0) / 100) * 100
                      }
                      size="lg"
                      color="orange"
                    />
                  </div>
                </Grid.Col>
              </Grid>
            </Card>
          )}

          {candidate.evaluations && candidate.evaluations.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Evaluation Details
              </Title>
              <Stack spacing="md">
                {candidate.evaluations.map((evaluation, idx) => (
                  <Card key={idx} padding="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Badge size="lg" tt="capitalize">
                        {evaluation.prompt_type}
                      </Badge>
                      <Badge size="lg" color="green" variant="light">
                        {formatScore(evaluation.total_score)} / 100
                      </Badge>
                    </Group>
                    {evaluation.response && (
                      <div>
                        <Text size="sm" fw={600} c="dimmed" mt="md" mb="xs">
                          Response
                        </Text>
                        <Text size="sm">{evaluation.response}</Text>
                      </div>
                    )}
                    {evaluation.evaluator_notes && (
                      <div>
                        <Text size="sm" fw={600} c="dimmed" mt="md" mb="xs">
                          Notes
                        </Text>
                        <Text size="sm" c="dimmed">
                          {evaluation.evaluator_notes}
                        </Text>
                      </div>
                    )}
                  </Card>
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>

      <Modal
        opened={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Candidate Profile"
        size="sm"
      >
        <Stack spacing="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Profile Link
            </Text>
            <Group gap="xs">
              <code
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#f1f3f5",
                  borderRadius: "4px",
                  fontSize: "12px",
                  wordBreak: "break-all",
                }}
              >
                {shareUrl}
              </code>
              <CopyButton value={shareUrl} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? "Copied" : "Copy"}
                    withArrow
                    position="right"
                  >
                    <ActionIcon
                      color={copied ? "teal" : "gray"}
                      variant="light"
                      onClick={copy}
                    >
                      {copied ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconLink size={16} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </div>
          <Text size="xs" c="dimmed">
            This link can be shared with others to view {candidate.first_name}'s
            evaluation profile.
          </Text>
        </Stack>
      </Modal>
    </>
  );
}
