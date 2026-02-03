import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Tabs,
  Title,
  Text,
  Group,
  TextInput,
  Stack,
  Card,
  Badge,
  ThemeIcon,
  Loader,
  Center,
  SimpleGrid,
} from "@mantine/core";
import {
  IconSearch,
  IconTrophy,
  IconChartBar,
  IconRipple,
} from "@tabler/icons-react";
import { Leaderboard } from "../components/Leaderboard";
import { SkillHeatmap } from "../components/SkillHeatmap";
import { CandidateGrid } from "../components/CandidateCard";
import { candidateService } from "../services/api";

export function Dashboard({ defaultTab = "overview" }) {
  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [leaderboardTop10, setLeaderboardTop10] = useState([]);
  const [loadingTop10, setLoadingTop10] = useState(true);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    loadTop10();
  }, []);

  const loadTop10 = async () => {
    setLoadingTop10(true);
    try {
      const response = await candidateService.getTopLeaderboard();
      setLeaderboardTop10(response.data);
    } catch (error) {
      console.error("Failed to load top 10:", error);
    } finally {
      setLoadingTop10(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await candidateService.searchCandidates(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack spacing="lg">
        <div>
          <Title order={1}>🎯 Candidate Evaluation Platform</Title>
          <Text c="dimmed" size="sm">
            Discover and evaluate top talent across crisis management,
            sustainability, and team building
          </Text>
        </div>

        <Tabs
          variant="pills"
          value={activeTab}
          onChange={(value) => setActiveTab(value ?? "overview")}
        >
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconTrophy size={14} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab
              value="leaderboard"
              leftSection={<IconChartBar size={14} />}
            >
              Full Leaderboard
            </Tabs.Tab>
            <Tabs.Tab value="analytics" leftSection={<IconRipple size={14} />}>
              Analytics
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" py="xl">
            <Stack spacing="xl">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section inheritPadding py="md">
                  <Title order={3}>🔍 Search Candidates</Title>
                </Card.Section>
                <TextInput
                  placeholder="Search by name, email, skill..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.currentTarget.value)}
                  size="md"
                  rightSection={searching && <Loader size="xs" />}
                />
              </Card>

              {searchResults.length > 0 ? (
                <div>
                  <Title order={3}>
                    Search Results ({searchResults.length})
                  </Title>
                  <CandidateGrid candidates={searchResults} />
                </div>
              ) : searchQuery ? (
                <Center py="xl">
                  <Text c="dimmed">No candidates found</Text>
                </Center>
              ) : (
                <>
                  <div>
                    <Title order={3}>🏆 Top 10 Performers</Title>
                    {loadingTop10 ? (
                      <Center py="xl">
                        <Loader />
                      </Center>
                    ) : (
                      <Leaderboard compact={true} />
                    )}
                  </div>

                  <div>
                    <Title order={3}>👥 All Candidates</Title>
                    <Text c="dimmed" size="sm" mb="md">
                      Browse and evaluate all candidates
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                      {leaderboardTop10.slice(0, 6).map((candidate) => (
                        <Card
                          key={candidate.id}
                          shadow="sm"
                          padding="lg"
                          radius="md"
                          withBorder
                          component={Link}
                          to={`/candidates/${candidate.id}`}
                          style={{
                            cursor: "pointer",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <Group justify="space-between" mb="xs">
                            <div>
                              <Text fw={600} size="sm">
                                {candidate.first_name} {candidate.last_name}
                              </Text>
                              <Badge size="sm" color="blue">
                                #{toNumber(candidate.rank, 0)}
                              </Badge>
                            </div>
                            <ThemeIcon
                              color="blue"
                              variant="light"
                              size="lg"
                              radius="md"
                            >
                              {toNumber(candidate.rank, 0) <= 3 ? "🏆" : "⭐"}
                            </ThemeIcon>
                          </Group>
                          <Text size="sm" c="dimmed">
                            {candidate.primary_skill}
                          </Text>
                          <Text size="sm" mt="xs">
                            Score:{" "}
                            {toNumber(candidate.overall_score, 0).toFixed(1)}
                          </Text>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </div>
                </>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="leaderboard" py="xl">
            <Leaderboard compact={false} />
          </Tabs.Panel>

          <Tabs.Panel value="analytics" py="xl">
            <SkillHeatmap />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
