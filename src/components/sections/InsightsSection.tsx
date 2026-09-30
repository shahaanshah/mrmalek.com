import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  PlayCircle,
  Video,
  Clock,
  Sparkles,
  X,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { VideoWithCategory } from '@/lib/cms/types';
import { derivedThumbnail, embedUrl, formatDate } from '@/lib/cms/types';
import SectionBadge from '@/components/ui/SectionBadge';
import type { LandingSection } from '@/lib/cms/sections.types';

interface InsightsSectionProps {
  /** Published videos from the CMS SQLite database */
  videos: VideoWithCategory[];
  /** Topics / categories */
  topics?: string[];
  /** Optional dynamic section headings from CMS */
  content?: Record<string, string>;
  section?: Partial<LandingSection>;
}

const DEFAULT_TOPIC_PILLS = [
  'All',
  'Product Strategy',
  'Agile & Delivery',
  'Career',
  'Case Study Breakdown',
];

export default function InsightsSection({ videos, topics = [], content, section }: InsightsSectionProps) {
  const [activeTopic, setActiveTopic] = useState<string>('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoWithCategory | null>(null);

  // Lock body scroll when video modal is open
  useEffect(() => {
    if (!selectedVideo) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVideo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedVideo]);

  // Combine default review topic pills with any custom topics from database
  const filterTabs = useMemo(() => {
    const combined = ['All', ...DEFAULT_TOPIC_PILLS.filter((p) => p !== 'All'), ...topics];
    return Array.from(new Set(combined));
  }, [topics]);

  // Featured video is always from all videos (unfiltered), so changing topic filter doesn't affect it
  const featuredVideo = useMemo(() => {
    return videos.find((v) => v.is_featured === 1) || videos[0] || null;
  }, [videos]);

  // Filter published videos by active topic (for the grid only)
  const filteredVideos = useMemo(() => {
    if (activeTopic === 'All') return videos;
    return videos.filter((v) => {
      const topicName = v.category_name || '';
      return topicName.toLowerCase() === activeTopic.toLowerCase();
    });
  }, [videos, activeTopic]);

  // Grid episodes: filtered list, always excluding the featured video
  const restEpisodes = useMemo(() => {
    if (!featuredVideo) return filteredVideos;
    return filteredVideos.filter((v) => v.id !== featuredVideo.id);
  }, [filteredVideos, featuredVideo]);

  const featured = featuredVideo;

  return (
    <section
      id="insights"
      className="section-padding relative"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.07) 0%, transparent 65%)',
        scrollMarginTop: '80px',
      }}
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="section-header reveal" style={{ marginBottom: '2.5rem' }}>
          <SectionBadge
            section={section}
            kicker={section?.kicker || content?.['pmtalks_kicker'] || 'PM TALKS & BREAKDOWNS'}
            icon={section?.kicker_icon || 'video'}
          />

          <h2 className="section-title">
            {section?.main_heading || content?.['pmtalks_title'] || 'Insights on'}{' '}
            <span className="gradient-text-purple">
              {section?.highlight_text || content?.['pmtalks_highlight'] || 'product management'}
            </span>
          </h2>
          <p className="section-subtitle">
            {section?.subtitle ||
              content?.['pmtalks_subtitle'] ||
              'Weekly short videos on how I plan, prioritise, and ship real products.'}
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="insight-empty reveal">
            <PlayCircle size={32} color="var(--accent-purple-light)" />
            <p style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 600, margin: 0 }}>
              No episodes published yet.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Check back next week for fresh breakdowns.
            </p>
          </div>
        ) : (
          <>
            {/* 01. Featured / Latest Episode Card — always visible regardless of filter */}
            {featured && (
              <div className="insight-featured-card reveal stagger-1">
                <div className="insight-top-line" />

                {/* Topbar */}
                <div className="insight-featured-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(168, 85, 247, 0.12)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: 'var(--accent-purple-light)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {featured.category_name ?? 'Product Strategy'}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={14} color="var(--accent-gold)" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                        {featured.is_featured === 1 ? 'Featured Episode' : 'Latest Episode'}
                      </span>
                    </div>
                    {featured.publish_date && (
                      <>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>•</span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {formatDate(featured.publish_date)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* 01/N counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      01 / {String(videos.length).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Main Content (2-Column Grid) */}
                <div className="insight-featured-content">
                  {/* Left: Thumbnail & Play Trigger */}
                  <div
                    className="insight-thumb-wrapper"
                    onClick={() => setSelectedVideo(featured)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play episode: ${featured.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedVideo(featured);
                      }
                    }}
                  >
                    {derivedThumbnail(featured) ? (
                      <img src={derivedThumbnail(featured)!} alt={featured.title} loading="lazy" />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(168, 85, 247, 0.08)',
                        }}
                      >
                        <PlayCircle size={48} color="var(--accent-purple-light)" />
                      </div>
                    )}
                    <div className="insight-thumb-overlay">
                      <div className="insight-play-btn" aria-hidden="true">
                        <Play size={24} fill="#ffffff" style={{ marginLeft: '3px' }} />
                      </div>
                    </div>
                    {featured.duration && (
                      <div className="insight-duration-badge">
                        <Clock size={12} />
                        <span>{featured.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Title, description & Watch button */}
                  <div className="insight-featured-info">
                    <h3>{featured.title}</h3>
                    <p>{featured.description}</p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedVideo(featured)}
                        className="btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <Play size={15} fill="currentColor" />
                        <span>Watch Breakdown</span>
                      </button>

                      {featured.duration && (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Duration: {featured.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Topic Filter Pills — below featured, controls only the grid */}
            <div
              className="reveal stagger-2"
              role="tablist"
              aria-label="Filter videos by topic"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '2.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginRight: '0.5rem',
                }}
              >
                <Filter size={12} />
                <span>Topic:</span>
              </div>
              {filterTabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  className="filter-tab"
                  aria-pressed={activeTopic === t}
                  aria-selected={activeTopic === t}
                  onClick={() => setActiveTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* 02. Grid of Episodes Below (filtered by topic) */}
            {restEpisodes.length > 0 ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Video size={16} color="var(--accent-purple-light)" />
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        margin: 0,
                      }}
                    >
                      More Episodes & Breakdowns
                    </h3>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {restEpisodes.length} episode{restEpisodes.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="insight-grid">
                  {restEpisodes.map((video, idx) => {
                    const thumb = derivedThumbnail(video);
                    const counter = String(idx + 1).padStart(2, '0');
                    const total = String(restEpisodes.length).padStart(2, '0');

                    return (
                      <div
                        key={video.id}
                        className="insight-episode-card reveal"
                        onClick={() => setSelectedVideo(video)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Watch: ${video.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedVideo(video);
                          }
                        }}
                      >
                        <div className="insight-top-line" />

                        {/* Card Topbar */}
                        <div className="insight-card-topbar">
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'rgba(168, 85, 247, 0.1)',
                              border: '1px solid rgba(168, 85, 247, 0.25)',
                              color: 'var(--accent-purple-light)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {video.category_name ?? 'PM Talk'}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {counter} / {total}
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div
                          className="insight-thumb-wrapper"
                          style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}
                        >
                          {thumb ? (
                            <img src={thumb} alt={video.title} loading="lazy" />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(168, 85, 247, 0.06)',
                              }}
                            >
                              <PlayCircle size={36} color="var(--accent-purple-light)" />
                            </div>
                          )}
                          <div className="insight-thumb-overlay">
                            <div className="insight-play-btn" style={{ width: '48px', height: '48px' }}>
                              <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
                            </div>
                          </div>
                          {video.duration && (
                            <div className="insight-duration-badge">
                              <Clock size={11} />
                              <span>{video.duration}</span>
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="insight-card-body">
                          <h4>{video.title}</h4>
                          <p>{video.description}</p>
                        </div>

                        {/* Footer */}
                        <div className="insight-card-footer">
                          <span>{formatDate(video.publish_date) || 'Recent'}</span>
                          <span
                            style={{
                              color: 'var(--accent-purple-light)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                            }}
                          >
                            Watch <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="insight-empty reveal" style={{ marginTop: '0.5rem' }}>
                <PlayCircle size={28} color="var(--accent-purple-light)" />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                  No episodes under "{activeTopic}" yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTopic('All')}
                  className="btn-secondary btn-sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  Show All Topics
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* In-Page Interactive Lightbox Video Modal */}
      {selectedVideo && (
        <div
          className="video-modal-backdrop"
          onClick={() => setSelectedVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.title}
        >
          <div
            className="video-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setSelectedVideo(null)}
              aria-label="Close video player"
            >
              <X size={20} />
            </button>

            {/* Video Player */}
            <div className="video-modal-player">
              {embedUrl(selectedVideo.video_url) ? (
                <iframe
                  src={`${embedUrl(selectedVideo.video_url)}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#ffffff',
                    gap: '1rem',
                  }}
                >
                  <p>Video embed URL could not be loaded.</p>
                  <a
                    href={selectedVideo.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary btn-sm"
                  >
                    Watch on YouTube
                  </a>
                </div>
              )}
            </div>

            {/* Video Metadata */}
            <div className="video-modal-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(168, 85, 247, 0.14)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: 'var(--accent-purple-light)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedVideo.category_name ?? 'PM Talks'}
                </span>
                {selectedVideo.duration && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    • {selectedVideo.duration}
                  </span>
                )}
                {selectedVideo.publish_date && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    • {formatDate(selectedVideo.publish_date)}
                  </span>
                )}
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.3,
                  margin: '0.25rem 0 0',
                }}
              >
                {selectedVideo.title}
              </h3>

              <p
                style={{
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
