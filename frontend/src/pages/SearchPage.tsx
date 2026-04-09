import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Pagination,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField, // For potential filter inputs
  Link, // For result links
} from '@mui/material';
// import { useSearchParams, Link as RouterLink } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../store';
// import { executeSearch } from '../store/slices/searchSlice'; // To be created

// Placeholder types
interface SearchResultItem {
  id: string | number;
  type: string; // e.g., 'User', 'Content', 'Product'
  title: string; // Main display text
  snippet?: string; // Highlighted text snippet
  url: string; // Link to the item
}

interface SearchFacetValue {
  value: string;
  label: string;
  count: number;
}

interface SearchFacet {
  field: string; // e.g., 'type', 'category', 'status'
  label: string; // e.g., 'Content Type', 'Category', 'Status'
  values: SearchFacetValue[];
}

interface SearchResponse {
  results: SearchResultItem[];
  facets: SearchFacet[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const SearchPage: React.FC = () => {
  // const [searchParams] = useSearchParams();
  // const dispatch = useDispatch<AppDispatch>();
  // const { results, facets, totalCount, page, pageSize, loading, error } = useSelector((state: RootState) => state.search); // To be created

  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});

  // Placeholder state
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock searchParams for demo
  const mockSearchParams = new URLSearchParams(window.location.search);
  const initialQuery = mockSearchParams.get('q') || '';


  useEffect(() => {
    // const queryParam = searchParams.get('q') || '';
    const queryParam = initialQuery;
    setQuery(queryParam);
    if (queryParam) {
      fetchResults(queryParam, 1, {}); // Fetch initial results
    } else {
        setSearchResponse(null); // Clear results if query is empty
    }
  }, [initialQuery]); // searchParams

  const fetchResults = async (currentQuery: string, requestedPage: number, currentFilters: Record<string, string[]>) => {
    setIsLoading(true);
    setError(null);
    console.log(
      'Fetching search results for:',
      currentQuery,
      'Page:',
      requestedPage,
      'Filters:',
      currentFilters
    );
    // await dispatch(executeSearch({ query: currentQuery, page: requestedPage, filters: currentFilters }));
    // Mock fetch
    setTimeout(() => {
      // Simulate results based on query/page/filters
      const mockResults: SearchResultItem[] = [];
      const total = currentQuery ? 25 : 0; // Mock total
      const pageSize = 10;
      const start = (requestedPage - 1) * pageSize;
      const end = Math.min(start + pageSize, total);

      for (let i = start; i < end; i++) {
        mockResults.push({
          id: `user-${i + 1}`,
          type: 'User',
          title: `User Result ${i + 1} for "${currentQuery}"`,
          snippet: `...highlighted snippet mentioning <strong>${currentQuery}</strong>...`,
          url: `/manage/users/edit/${i + 1}`,
        });
      }

      const mockFacets: SearchFacet[] = currentQuery
        ? [
            {
              field: 'type',
              label: 'Content Type',
              values: [
                { value: 'User', label: 'User', count: 15 },
                { value: 'Page', label: 'Page', count: 8 },
                { value: 'Post', label: 'Post', count: 2 },
              ],
            },
            {
              field: 'status',
              label: 'Status',
              values: [
                { value: 'active', label: 'Active', count: 20 },
                { value: 'inactive', label: 'Inactive', count: 5 },
              ],
            },
          ]
        : [];


      setSearchResponse({
        results: mockResults,
        facets: mockFacets,
        totalCount: total,
        page: requestedPage,
        pageSize: pageSize,
      });
      setIsLoading(false);
    }, 1200);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    fetchResults(query, value, selectedFacets);
  };

  const handleFacetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: facetValue, checked } = event.target;
    const field = name; // Assuming name is the facet field

    setSelectedFacets((prev) => {
      const currentValues = prev[field] || [];
      let newValues: string[];
      if (checked) {
        newValues = [...currentValues, facetValue];
      } else {
        newValues = currentValues.filter((v) => v !== facetValue);
      }
      const updatedFacets = { ...prev, [field]: newValues };
      // Remove field if no values are selected
      if (updatedFacets[field].length === 0) {
        delete updatedFacets[field];
      }
      // Trigger search with new facets on page 1
      setCurrentPage(1);
      fetchResults(query, 1, updatedFacets);
      return updatedFacets;
    });
  };

  const totalPages = searchResponse ? Math.ceil(searchResponse.totalCount / searchResponse.pageSize) : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Results {query && `for "${query}"`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Facets/Filters */}
        {searchResponse && searchResponse.facets.length > 0 && (
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              {searchResponse.facets.map((facet) => (
                <Box key={facet.field} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {facet.label}
                  </Typography>
                  <FormGroup>
                    {facet.values.map((val) => (
                      <FormControlLabel
                        key={val.value}
                        control={
                          <Checkbox
                            name={facet.field}
                            value={val.value}
                            checked={selectedFacets[facet.field]?.includes(val.value) || false}
                            onChange={handleFacetChange}
                            size="small"
                          />
                        }
                        label={`${val.label} (${val.count})`}
                      />
                    ))}
                  </FormGroup>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        {/* Search Results */}
        <Grid size={{ xs: 12, md: searchResponse && searchResponse.facets.length > 0 ? 9 : 12 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : !searchResponse || searchResponse.results.length === 0 ? (
            <Typography sx={{ textAlign: 'center', p: 3 }}>
              {query ? 'No results found.' : 'Enter a search term above.'}
            </Typography>
          ) : (
            <Paper>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing results {(searchResponse.page - 1) * searchResponse.pageSize + 1} -
                  {Math.min(
                    searchResponse.page * searchResponse.pageSize,
                    searchResponse.totalCount
                  )}{' '}
                  of {searchResponse.totalCount}
                </Typography>
              </Box>
              <List disablePadding>
                {searchResponse.results.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Link /* component={RouterLink} */ href={item.url} underline="hover">
                            {item.title}
                          </Link>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {item.type}
                            </Typography>
                            {item.snippet && (
                              <span dangerouslySetInnerHTML={{ __html: ` - ${item.snippet}` }} />
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider component="li" variant="inset" />
                  </React.Fragment>
                ))}
              </List>
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchPage;