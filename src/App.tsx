/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/landing/LandingPage';
import Analyzer from './components/analyzer/Analyzer';
import GstSearch from './components/gst/GstSearch';
import MapViewer from './components/map/MapViewer';
import DefaulterSearch from './components/defaulters/DefaulterSearch';

type ViewMode = 'landing' | 'analyzer' | 'gst' | 'map' | 'defaulter';

export default function App() {
  const [view, setView] = useState<ViewMode>('landing');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar onViewChange={setView} currentView={view} />
      <main className="flex-1">
        {view === 'landing' && <LandingPage onGetStarted={() => setView('analyzer')} onViewChange={setView} />}
        {view === 'analyzer' && <Analyzer />}
        {view === 'gst' && <GstSearch />}
        {view === 'map' && <MapViewer />}
        {view === 'defaulter' && <DefaulterSearch />}
      </main>
    </div>
  );
}
