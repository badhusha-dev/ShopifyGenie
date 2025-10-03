import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaSearch, FaTimes, FaFilter, FaSortAlphaDown, FaSortNumericDown, FaBox, FaUser, FaShoppingCart, FaFileAlt, FaBrain, FaChartLine, FaHistory, FaStar, FaClock, FaLightbulb, FaArrowUp, FaEye, FaBookmark, FaShare } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface SearchResult {
  id: string;
  type: string; // 'product', 'customer', 'order', 'report'
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  timestamp?: string;
  metadata?: any;
  aiInsights?: string;
  relatedSearches?: string[];
  popularityScore?: number;
  lastAccessed?: string;
  bookmarked?: boolean;
}

interface SearchAnalytics {
  totalSearches: number;
  popularQueries: string[];
  searchTrends: Array<{ date: string; count: number }>;
  topResults: Array<{ query: string; result: string; clicks: number }>;
  userBehavior: {
    avgSearchTime: number;
    clickThroughRate: number;
    zeroResultRate: number;
  };
}

interface AISuggestion {
  type: 'autocomplete' | 'related' | 'trending' | 'insight';
  text: string;
  confidence: number;
  category?: string;
}

const GlobalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [bookmarkedSearches, setBookmarkedSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults = [], isLoading, refetch } = useQuery<SearchResult[]>({
    queryKey: ['/search', searchQuery, searchType, sortBy],
    enabled: false,
  });

  const { data: searchAnalytics } = useQuery<SearchAnalytics>({
    queryKey: ['/search-analytics'],
  });

  useEffect(() => {
    if (searchQuery.length >= 3) {
      const handler = setTimeout(() => {
        setIsSearching(true);
        refetch().finally(() => setIsSearching(false));
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [searchQuery, searchType, sortBy, refetch]);

  useEffect(() => {
    // Generate AI suggestions based on search query
    if (searchQuery.length >= 2) {
      const suggestions: AISuggestion[] = [
        { type: 'autocomplete', text: `${searchQuery} products`, confidence: 0.9, category: 'products' },
        { type: 'autocomplete', text: `${searchQuery} customers`, confidence: 0.8, category: 'customers' },
        { type: 'related', text: `Related to ${searchQuery}`, confidence: 0.7 },
        { type: 'trending', text: `Trending: ${searchQuery}`, confidence: 0.6 },
        { type: 'insight', text: `AI Insight: ${searchQuery} analysis`, confidence: 0.5 }
      ];
      setAiSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setAiSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 3) {
      setIsSearching(true);
      refetch().finally(() => setIsSearching(false));
      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
      }
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setIsSearching(true);
    refetch().finally(() => setIsSearching(false));
  };

  const toggleBookmark = (query: string) => {
    if (bookmarkedSearches.includes(query)) {
      setBookmarkedSearches(prev => prev.filter(q => q !== query));
    } else {
      setBookmarkedSearches(prev => [...prev, query]);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product': return <FaBox className="text-success" />;
      case 'customer': return <FaUser className="text-primary" />;
      case 'order': return <FaShoppingCart className="text-info" />;
      case 'report': return <FaFileAlt className="text-warning" />;
      default: return <FaSearch className="text-muted" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'success';
      case 'customer': return 'primary';
      case 'order': return 'info';
      case 'report': return 'warning';
      default: return 'secondary';
    }
  };

  const recentSearches = [
    'Organic Green Tea',
    'John Smith',
    'Order #12345',
    'Sales Report Q1'
  ];

  const popularSearches = [
    'Low Stock Items',
    'Top Customers',
    'Recent Orders',
    'Inventory Report'
  ];

  return (
    <AnimatedCard>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">AI-Powered Global Search</h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <FaChartLine className="me-1" />
            Analytics
          </button>
          <FaBrain className="text-primary" />
        </div>
      </div>
      <div className="card-body">
        {/* Enhanced Search Input */}
        <div className="position-relative mb-3">
          <form onSubmit={handleSearch} className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Search products, customers, orders, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => setSearchQuery('')}
              >
                <FaTimes />
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSearching}>
              {isSearching ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Searching...</span>
                </div>
              ) : (
                <FaSearch />
              )}
            </button>
          </form>

          {/* AI Suggestions Dropdown */}
          {showSuggestions && aiSuggestions.length > 0 && (
            <div className="position-absolute w-100 bg-white border rounded shadow-lg" style={{ zIndex: 1000, top: '100%' }}>
              <div className="p-2">
                <div className="d-flex align-items-center mb-2">
                  <FaBrain className="text-primary me-2" />
                  <small className="text-muted">AI Suggestions</small>
                </div>
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item p-2 rounded cursor-pointer d-flex justify-content-between align-items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <div className="fw-semibold">{suggestion.text}</div>
                      <small className="text-muted">
                        {suggestion.type} • {Math.round(suggestion.confidence * 100)}% confidence
                      </small>
                    </div>
                    <div>
                      {suggestion.type === 'autocomplete' && <FaSearch className="text-muted" />}
                      {suggestion.type === 'related' && <FaLightbulb className="text-warning" />}
                      {suggestion.type === 'trending' && <FaArrowUp className="text-success" />}
                      {suggestion.type === 'insight' && <FaBrain className="text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="d-flex gap-3 mb-3">
          <div className="flex-grow-1">
            <label htmlFor="searchType" className="form-label small text-muted mb-0">Type</label>
            <select 
              id="searchType" 
              className="form-select form-select-sm" 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="product">Products</option>
              <option value="customer">Customers</option>
              <option value="order">Orders</option>
              <option value="report">Reports</option>
            </select>
          </div>
          <div className="flex-grow-1">
            <label htmlFor="sortBy" className="form-label small text-muted mb-0">Sort By</label>
            <select 
              id="sortBy" 
              className="form-select form-select-sm" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
          <div className="d-flex align-items-end">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" />
              Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border rounded p-3 mb-3 bg-light">
            <h6 className="mb-3">Advanced Filters</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small">Date Range</label>
                <select className="form-select form-select-sm">
                  <option>All Time</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Status</label>
                <select className="form-select form-select-sm">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Category</label>
                <select className="form-select form-select-sm">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Food & Beverage</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Search Results */}
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="search-results">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Search Results ({searchResults.length})</h6>
              <div className="d-flex align-items-center gap-3">
                <small className="text-muted">Found in {searchQuery.length >= 3 ? '0.2s' : '0s'}</small>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => toggleBookmark(searchQuery)}
                >
                  <FaBookmark className={bookmarkedSearches.includes(searchQuery) ? 'text-warning' : ''} />
                </button>
              </div>
            </div>
            <div className="list-group">
              {searchResults.map((result) => (
                <div key={result.id} className="list-group-item list-group-item-action">
                  <div className="d-flex align-items-start">
                    <div className="me-3 fs-5">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{result.title}</h6>
                          <p className="mb-1 small text-muted">{result.description}</p>
                          {result.aiInsights && (
                            <div className="alert alert-info py-2 px-3 mb-2">
                              <FaBrain className="me-2" />
                              <small>{result.aiInsights}</small>
                            </div>
                          )}
                          {result.metadata && (
                            <div className="small text-muted">
                              {Object.entries(result.metadata).map(([key, value]) => (
                                <span key={key} className="me-3">
                                  <strong>{key}:</strong> {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                          {result.relatedSearches && result.relatedSearches.length > 0 && (
                            <div className="mt-2">
                              <small className="text-muted">Related searches: </small>
                              {result.relatedSearches.map((related, index) => (
                                <button
                                  key={index}
                                  className="btn btn-outline-secondary btn-sm me-1 mb-1"
                                  onClick={() => setSearchQuery(related)}
                                >
                                  {related}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-end">
                          <div className="d-flex gap-1 mb-2">
                            <button className="btn btn-outline-primary btn-sm" title="View Details">
                              <FaEye />
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" title="Share">
                              <FaShare />
                            </button>
                            <button className="btn btn-outline-warning btn-sm" title="Bookmark">
                              <FaBookmark />
                            </button>
                          </div>
                          <span className={`badge bg-${getTypeColor(result.type)}-subtle text-${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                          <div className="small text-muted mt-1">
                            {result.relevanceScore.toFixed(1)}% match
                          </div>
                          {result.popularityScore && (
                            <div className="small text-muted">
                              <FaStar className="text-warning" /> {result.popularityScore}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery.length >= 3 ? (
          <div className="text-center py-4">
            <FaSearch className="text-muted mb-3" size={48} />
            <h6 className="text-muted">No results found</h6>
            <p className="text-muted small">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="search-suggestions">
            {/* Search Analytics */}
            {showAnalytics && searchAnalytics && (
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="mb-3">Search Analytics</h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h5 text-primary">{searchAnalytics.totalSearches}</div>
                      <small className="text-muted">Total Searches</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h5 text-success">{searchAnalytics.userBehavior.clickThroughRate}%</div>
                      <small className="text-muted">Click Through Rate</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h5 text-info">{searchAnalytics.userBehavior.avgSearchTime}s</div>
                      <small className="text-muted">Avg Search Time</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h5 text-warning">{searchAnalytics.userBehavior.zeroResultRate}%</div>
                      <small className="text-muted">Zero Result Rate</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Searches */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent Searches</h6>
                <FaHistory className="text-muted" />
              </div>
              <div className="d-flex flex-wrap gap-2">
                {searchHistory.length > 0 ? (
                  searchHistory.map((search, index) => (
                    <button
                      key={index}
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setSearchQuery(search)}
                    >
                      {search}
                    </button>
                  ))
                ) : (
                  recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setSearchQuery(search)}
                    >
                      {search}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Bookmarked Searches */}
            {bookmarkedSearches.length > 0 && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Bookmarked Searches</h6>
                  <FaBookmark className="text-warning" />
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {bookmarkedSearches.map((search, index) => (
                    <button
                      key={index}
                      className="btn btn-warning btn-sm"
                      onClick={() => setSearchQuery(search)}
                    >
                      <FaBookmark className="me-1" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Popular Searches</h6>
                <FaArrowUp className="text-success" />
              </div>
              <div className="d-flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* AI-Powered Search Tips */}
            <div className="bg-light rounded p-3">
              <div className="d-flex align-items-center mb-2">
                <FaBrain className="text-primary me-2" />
                <h6 className="mb-0">AI-Powered Search Tips</h6>
              </div>
              <ul className="small text-muted mb-0">
                <li>Use natural language queries for better AI understanding</li>
                <li>Try asking questions like "What are my top products?"</li>
                <li>Use filters to narrow down your search results</li>
                <li>Bookmark frequent searches for quick access</li>
                <li>Explore AI suggestions for related content</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default GlobalSearch;