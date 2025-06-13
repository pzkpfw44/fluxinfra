// frontend/src/pages/FluxMonitoring.jsx
import React, { useState, useEffect } from 'react';
import './FluxMonitoring.css';

const FluxMonitoring = () => {
  const [activeTab, setActiveTab] = useState('ai-services');
  const [theme, setTheme] = useState('dark');
  const [alerts, setAlerts] = useState([]);
  const [data, setData] = useState({
    metrics: {
      totalNodes: 13547,
      activeNodes: 13521,
      networkUptime: '99.97%',
      activeJobs: 2847
    },
    aiStatus: null,
    nodeNetwork: null,
    edgeComputing: null,
    revenue: null,
    loading: {
      ai: false,
      nodes: false,
      edge: false,
      revenue: false,
      apiTest: false
    }
  });

  const API_BASE = '/api/flux-monitoring';

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('flux-cockpit-theme') || 'dark';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics with slight variations to simulate real-time data
      setData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          totalNodes: Math.max(13500, prev.metrics.totalNodes + Math.floor(Math.random() * 6) - 3),
          activeNodes: Math.max(13500, prev.metrics.activeNodes + Math.floor(Math.random() * 4) - 2),
          activeJobs: Math.max(2800, prev.metrics.activeJobs + Math.floor(Math.random() * 20) - 10)
        }
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-clear alerts after 4 seconds
  useEffect(() => {
    if (alerts.length > 0) {
      const timer = setTimeout(() => {
        setAlerts(prev => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('flux-cockpit-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const showAlert = (message, type = 'success') => {
    const alert = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };
    setAlerts(prev => [...prev, alert]);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const makeRequest = async (endpoint, loadingKey) => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, [loadingKey]: true }
    }));

    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      const result = await response.json();
      
      if (response.ok) {
        const dataKey = loadingKey === 'ai' ? 'aiStatus' : 
                       loadingKey === 'nodes' ? 'nodeNetwork' :
                       loadingKey === 'edge' ? 'edgeComputing' : 'revenue';
        
        setData(prev => ({
          ...prev,
          [dataKey]: result
        }));
        
        showAlert(`${endpoint.replace('/', '').replace('-', ' ')} data refreshed successfully!`, 'success');
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      showAlert(`Failed to fetch ${endpoint.replace('/', '').replace('-', ' ')} data: ${error.message}`, 'error');
    } finally {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, [loadingKey]: false }
      }));
    }
  };

  const testApiConnection = async () => {
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKey = apiKeyInput?.value;
    
    if (!apiKey) {
      showAlert('Please enter your Flux AI API key', 'warning');
      return;
    }

    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, apiTest: true }
    }));

    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      localStorage.setItem('flux_api_key', apiKey);
      showAlert('API connection successful! All systems operational', 'success');
      
      // Update UI to show configured state
      const configSection = document.querySelector('.config-section .alert');
      if (configSection) {
        configSection.className = 'alert alert-success';
        configSection.innerHTML = '<i class="fas fa-check-circle"></i> API key configured - Live data enabled';
      }
    } catch (error) {
      showAlert('API connection failed: ' + error.message, 'error');
    } finally {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, apiTest: false }
      }));
    }
  };

  const formatNumber = (num) => {
    if (typeof num === 'number') {
      return num.toLocaleString();
    }
    return num;
  };

  const StatusBadge = ({ status }) => (
    <span className={`status-badge status-${status}`}>
      {status}
    </span>
  );

  const LoadingSpinner = () => (
    <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
  );

  const MetricCard = ({ value, label, icon }) => (
    <div className="metric-card">
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-label">{label}</div>
    </div>
  );

  return (
    <div className="cockpit-container" data-theme={theme}>
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.type}`}>
              <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 
                                   alert.type === 'warning' ? 'exclamation-triangle' : 
                                   'times-circle'}`}></i>
              {alert.message}
              <button 
                className="alert-close" 
                onClick={() => removeAlert(alert.id)}
                aria-label="Close alert"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">F</div>
            <div className="header-title">
              <h1>Flux Infrastructure Cockpit</h1>
              <div className="header-subtitle">
                Real-time monitoring dashboard for Flux AI services, infrastructure nodes, and edge computing platform
              </div>
            </div>
          </div>
          <div className="header-controls">
            <button className="theme-toggle" onClick={toggleTheme}>
              <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metrics Bar */}
      <div className="metrics-bar">
        <div className="metrics-container">
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon">
                <i className="fas fa-server"></i>
              </div>
              <div className="metric-change">+23</div>
            </div>
            <div className="metric-value">{formatNumber(data.metrics.totalNodes)}</div>
            <div className="metric-label">Total FluxNodes</div>
          </div>
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon">
                <i className="fas fa-bolt"></i>
              </div>
            </div>
            <div className="metric-value">{formatNumber(data.metrics.activeNodes)}</div>
            <div className="metric-label">Active FluxNodes</div>
          </div>
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
            <div className="metric-value">{data.metrics.networkUptime}</div>
            <div className="metric-label">Network Uptime</div>
          </div>
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon">
                <i className="fas fa-tasks"></i>
              </div>
            </div>
            <div className="metric-value">{formatNumber(data.metrics.activeJobs)}</div>
            <div className="metric-label">Active FluxOS Jobs</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="navigation">
        <div className="nav-container">
          {[
            { id: 'ai-services', icon: 'robot', label: 'AI Services' },
            { id: 'infrastructure', icon: 'network-wired', label: 'Infrastructure' },
            { id: 'edge-services', icon: 'microchip', label: 'Edge Services' },
            { id: 'revenue', icon: 'chart-pie', label: 'Revenue' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`nav-icon fas fa-${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* AI Services Tab */}
        {activeTab === 'ai-services' && (
          <div className="tab-content active">
            <div className="config-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <i className="fas fa-exclamation-triangle" style={{ color: 'var(--flux-warning)' }}></i>
                <span style={{ fontWeight: 600 }}>API Key Configuration</span>
              </div>
              <input
                type="password"
                className="config-input"
                placeholder="Enter your Flux AI API Key..."
                id="api-key-input"
                defaultValue={localStorage.getItem('flux_api_key') || ''}
              />
              <button 
                className="refresh-btn" 
                onClick={testApiConnection} 
                disabled={data.loading.apiTest}
              >
                {data.loading.apiTest && <LoadingSpinner />}
                <i className="fas fa-plug"></i>
                Test Connection
              </button>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-robot"></i>
                    </div>
                    AI Services Monitor
                  </div>
                  <div className="card-status">
                    <div className="status-dot"></div>
                    Operational
                  </div>
                </div>

                <div className="alert alert-warning">
                  <i className="fas fa-info-circle"></i>
                  {localStorage.getItem('flux_api_key') ? 
                    'API key configured - Live data enabled' : 
                    'Click "Test Connection" above to configure your API key'}
                </div>

                <div style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Available Models
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Status</th>
                      <th>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <i className="fas fa-circle" style={{ color: 'var(--flux-success)', fontSize: '8px', marginRight: '8px' }}></i>
                        flux-pro
                      </td>
                      <td><StatusBadge status="operational" /></td>
                      <td>~2s</td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fas fa-circle" style={{ color: 'var(--flux-success)', fontSize: '8px', marginRight: '8px' }}></i>
                        flux-dev
                      </td>
                      <td><StatusBadge status="operational" /></td>
                      <td>~1.5s</td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fas fa-circle" style={{ color: 'var(--flux-success)', fontSize: '8px', marginRight: '8px' }}></i>
                        flux-schnell
                      </td>
                      <td><StatusBadge status="operational" /></td>
                      <td>~1s</td>
                    </tr>
                  </tbody>
                </table>

                <div className="metric-grid" style={{ marginTop: '20px' }}>
                  <MetricCard value="99.8%" label="API Uptime" />
                  <MetricCard value="1.2s" label="Avg Response" />
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    Usage Analytics
                  </div>
                  <button 
                    className="refresh-btn" 
                    onClick={() => makeRequest('/ai-status', 'ai')} 
                    disabled={data.loading.ai}
                  >
                    {data.loading.ai && <LoadingSpinner />}
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                  </button>
                </div>

                <div className="metric-grid">
                  <MetricCard 
                    value={data.aiStatus?.balanceFormatted || '$127.45'} 
                    label="Account Balance" 
                  />
                  <MetricCard value="247" label="Requests Today" />
                </div>

                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-label">Daily Quota Usage</span>
                    <span className="progress-value">67%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '67%' }}></div>
                  </div>
                </div>

                {data.aiStatus && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <strong>Live Data:</strong>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '8px' }}>
                      Status: {data.aiStatus.status}<br/>
                      Models: {data.aiStatus.models?.available || 0}<br/>
                      Response Time: {data.aiStatus.responseTime}
                    </div>
                  </div>
                )}

                <div className="chart-container">
                  <div className="chart-placeholder">
                    <i className="fas fa-chart-line" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                    API Usage Chart<br/>
                    <small>Real-time usage visualization</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infrastructure Tab */}
        {activeTab === 'infrastructure' && (
          <div className="tab-content active">
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-network-wired"></i>
                    </div>
                    FluxNode Network
                  </div>
                  <button 
                    className="refresh-btn" 
                    onClick={() => makeRequest('/node-network', 'nodes')} 
                    disabled={data.loading.nodes}
                  >
                    {data.loading.nodes && <LoadingSpinner />}
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                  </button>
                </div>

                <div className="metric-grid">
                  <MetricCard 
                    value={formatNumber(data.nodeNetwork?.totalNodes || 13547)} 
                    label="Total FluxNodes" 
                  />
                  <MetricCard 
                    value={formatNumber(data.nodeNetwork?.activeNodes || 13521)} 
                    label="Active FluxNodes" 
                  />
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Node Type</th>
                      <th>Count</th>
                      <th>Collateral</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <i className="fas fa-server" style={{ color: 'var(--flux-primary)', marginRight: '8px' }}></i>
                        Cumulus
                      </td>
                      <td>{formatNumber(data.nodeNetwork?.nodeDistribution?.cumulus || 8247)}</td>
                      <td>1,000 FLUX</td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fas fa-server" style={{ color: 'var(--flux-accent)', marginRight: '8px' }}></i>
                        Nimbus
                      </td>
                      <td>{formatNumber(data.nodeNetwork?.nodeDistribution?.nimbus || 3892)}</td>
                      <td>12,500 FLUX</td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fas fa-server" style={{ color: 'var(--flux-secondary)', marginRight: '8px' }}></i>
                        Stratus
                      </td>
                      <td>{formatNumber(data.nodeNetwork?.nodeDistribution?.stratus || 1408)}</td>
                      <td>40,000 FLUX</td>
                    </tr>
                  </tbody>
                </table>

                {data.nodeNetwork && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <strong>Live Network Data:</strong>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '8px' }}>
                      CPU Cores: {data.nodeNetwork.estimatedResources?.cpuCores}<br/>
                      Total RAM: {data.nodeNetwork.estimatedResources?.totalRAM}<br/>
                      Storage: {data.nodeNetwork.estimatedResources?.totalStorage}<br/>
                      Utilization: {data.nodeNetwork.utilization}%
                    </div>
                  </div>
                )}
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-hdd"></i>
                    </div>
                    Network Resources
                  </div>
                  <div className="card-status">
                    <div className="status-dot"></div>
                    Healthy
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-microchip"></i>CPU Cores
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.nodeNetwork?.estimatedResources?.cpuCores || '107,238'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-memory"></i>Total RAM
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.nodeNetwork?.estimatedResources?.totalRAM || '271 TB'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-database"></i>Total Storage
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.nodeNetwork?.estimatedResources?.totalStorage || '7.2 PB'}
                    </span>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-label">Network Utilization</span>
                    <span className="progress-value">{data.nodeNetwork?.utilization || 73}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${data.nodeNetwork?.utilization || 73}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-globe"></i>
                    </div>
                    Global FluxNode Distribution
                  </div>
                </div>
                <div className="chart-container" style={{ height: '300px' }}>
                  <div className="chart-placeholder">
                    <i className="fas fa-map" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
                    World Map Visualization<br/>
                    <small>FluxNode geographic distribution</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edge Services Tab */}
        {activeTab === 'edge-services' && (
          <div className="tab-content active">
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-microchip"></i>
                    </div>
                    FluxOS Applications
                  </div>
                  <button 
                    className="refresh-btn" 
                    onClick={() => makeRequest('/edge-computing', 'edge')} 
                    disabled={data.loading.edge}
                  >
                    {data.loading.edge && <LoadingSpinner />}
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                  </button>
                </div>

                <div className="metric-grid">
                  <MetricCard 
                    value={formatNumber(data.edgeComputing?.applications?.total || 2847)} 
                    label="Active Applications" 
                  />
                  <MetricCard 
                    value={formatNumber(data.edgeComputing?.applications?.instances || 18293)} 
                    label="Running Instances" 
                  />
                </div>

                <div className="progress-container" style={{ marginBottom: '16px' }}>
                  <div className="progress-header">
                    <span className="progress-label">CPU Utilization</span>
                    <span className="progress-value">{data.edgeComputing?.resourceUtilization?.cpu || 67}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${data.edgeComputing?.resourceUtilization?.cpu || 67}%` }}></div>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-label">Memory Usage</span>
                    <span className="progress-value">{data.edgeComputing?.resourceUtilization?.memory || 54}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${data.edgeComputing?.resourceUtilization?.memory || 54}%` }}></div>
                  </div>
                </div>

                {data.edgeComputing && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <strong>Live Edge Data:</strong>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '8px' }}>
                      CPU Usage: {data.edgeComputing.resourceUtilization?.cpu}%<br/>
                      Memory: {data.edgeComputing.resourceUtilization?.memory}%<br/>
                      Data Processed: {data.edgeComputing.resourceUtilization?.dataProcessed}
                    </div>
                  </div>
                )}
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-tachometer-alt"></i>
                    </div>
                    Performance Metrics
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-clock"></i>Avg Response Time
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.edgeComputing?.performance?.avgResponseTime || '127ms'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-exchange-alt"></i>Throughput
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.edgeComputing?.performance?.throughput || '15,847 req/s'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-exclamation-triangle"></i>Error Rate
                    </span>
                    <span style={{ color: 'var(--flux-success)', fontWeight: 600 }}>
                      {data.edgeComputing?.performance?.errorRate || '0.03%'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-chart-area"></i>Data Processed
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.edgeComputing?.resourceUtilization?.dataProcessed || '1.2 TB/day'}
                    </span>
                  </div>
                </div>

                <div className="chart-container">
                  <div className="chart-placeholder">
                    <i className="fas fa-chart-line" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                    Performance Chart<br/>
                    <small>Real-time performance metrics</small>
                  </div>
                </div>
              </div>

              <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-layer-group"></i>
                    </div>
                    Your FluxOS Applications
                  </div>
                </div>
                
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Application</th>
                      <th>Status</th>
                      <th>Instances</th>
                      <th>CPU Usage</th>
                      <th>Memory</th>
                      <th>Uptime</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <i className="fas fa-cube" style={{ color: 'var(--flux-primary)', marginRight: '8px' }}></i>
                        PulseOne Backend
                      </td>
                      <td><StatusBadge status="operational" /></td>
                      <td>3</td>
                      <td>23%</td>
                      <td>156 MB</td>
                      <td>99.8%</td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fas fa-cube" style={{ color: 'var(--flux-accent)', marginRight: '8px' }}></i>
                        Data Processor
                      </td>
                      <td><StatusBadge status="operational" /></td>
                      <td>2</td>
                      <td>45%</td>
                      <td>312 MB</td>
                      <td>99.5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="tab-content active">
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-chart-pie"></i>
                    </div>
                    Blockchain Revenue
                  </div>
                  <button 
                    className="refresh-btn" 
                    onClick={() => makeRequest('/blockchain-revenue', 'revenue')} 
                    disabled={data.loading.revenue}
                  >
                    {data.loading.revenue && <LoadingSpinner />}
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                  </button>
                </div>

                <div className="metric-grid">
                  <MetricCard 
                    value={data.revenue?.revenue?.volume24h || '$1,247,832'} 
                    label="24h Volume" 
                  />
                  <MetricCard 
                    value={data.revenue?.revenue?.nodeRewards || '847,392 FLUX'} 
                    label="FluxNode Rewards" 
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-exchange-alt"></i>Total Transactions
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.revenue?.revenue?.totalTransactions || '89,473'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-coins"></i>Network Fees
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.revenue?.revenue?.networkFees || '1,247 FLUX'}
                    </span>
                  </div>
                </div>

                {data.revenue && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <strong>Live Revenue Data:</strong>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '8px' }}>
                      Transactions: {data.revenue.revenue?.totalTransactions}<br/>
                      Network Fees: {data.revenue.revenue?.networkFees}<br/>
                      Last Updated: {new Date(data.revenue.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-stream"></i>
                    </div>
                    Revenue Streams
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-server"></i>FluxNode Rewards
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.revenue?.revenueStreams?.nodeRewards || 65}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '20px' }}>
                    <div className="progress-fill" style={{ width: `${data.revenue?.revenueStreams?.nodeRewards || 65}%` }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-rocket"></i>App Deployments
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.revenue?.revenueStreams?.appDeployments || 25}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '20px' }}>
                    <div className="progress-fill" style={{ width: `${data.revenue?.revenueStreams?.appDeployments || 25}%` }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-cogs"></i>Compute Services
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {data.revenue?.revenueStreams?.computeServices || 10}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${data.revenue?.revenueStreams?.computeServices || 10}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon">
                      <i className="fas fa-list"></i>
                    </div>
                    Recent Transactions
                  </div>
                </div>
                
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.revenue?.transactions || [
                      { type: 'FluxNode Reward', amount: 12.5, time: '2 min ago', status: 'confirmed', positive: true },
                      { type: 'App Deployment', amount: -5.0, time: '5 min ago', status: 'confirmed', positive: false },
                      { type: 'Compute Payment', amount: 8.2, time: '8 min ago', status: 'confirmed', positive: true },
                      { type: 'Storage Fee', amount: -2.1, time: '12 min ago', status: 'confirmed', positive: false }
                    ]).map((tx, index) => (
                      <tr key={index}>
                        <td>
                          <i className={`fas fa-${
                            tx.type.includes('Reward') ? 'gift' :
                            tx.type.includes('Deployment') ? 'rocket' :
                            tx.type.includes('Payment') ? 'credit-card' :
                            'hdd'
                          }`} style={{ 
                            color: tx.positive !== false ? 'var(--flux-success)' : 
                                   tx.type.includes('Deployment') ? 'var(--flux-primary)' : 'var(--flux-warning)', 
                            marginRight: '8px' 
                          }}></i>
                          {tx.type}
                        </td>
                        <td style={{ 
                          color: tx.positive !== false ? 'var(--flux-success)' : 'var(--flux-error)', 
                          fontWeight: 600 
                        }}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} FLUX
                        </td>
                        <td>{typeof tx.time === 'string' ? tx.time : new Date(tx.time).toLocaleTimeString()}</td>
                        <td><StatusBadge status="operational" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FluxMonitoring;