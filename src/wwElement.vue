<template>
  <div class="gantt-wrapper">
    <!-- Loading / error banners -->
    <div v-if="loading" class="gantt-banner">Chargement…</div>
    <div v-else-if="error" class="gantt-banner gantt-banner--error">{{ error }}</div>

    <!-- GANTT SCROLL AREA -->
    <div class="gantt-scroll" ref="scrollEl">
      <div class="gantt-inner" :style="{ width: innerWidth + 'px' }">

        <!-- STICKY HEADER BLOCK -->
        <div class="gantt-header-block">
          <!-- Quarter row -->
          <div class="gantt-row">
            <div class="left-cell sticky-cell hdr-bg nav-cell">
              <button class="nav-btn" @click="offsetMonths -= 3">&#8249;</button>
              <button class="nav-btn" @click="offsetMonths += 3">&#8250;</button>
            </div>
            <div class="tl-header">
              <div
                v-for="q in quarters"
                :key="q.key"
                class="quarter-cell"
                :style="{ width: (q.span * monthWidth) + 'px' }"
              >{{ q.label }}</div>
            </div>
          </div>

          <!-- Month row -->
          <div class="gantt-row">
            <div class="left-cell sticky-cell hdr-bg"></div>
            <div class="tl-header">
              <div
                v-for="m in months"
                :key="m.key"
                class="month-cell"
                :class="{ 'is-current': m.isCurrent }"
                :style="{ width: monthWidth + 'px' }"
              >{{ m.label }}</div>
            </div>
          </div>
        </div>

        <!-- PROJECT ROWS -->
        <template v-for="project in displayProjects" :key="project.id">
          <!-- Main row -->
          <div
            class="gantt-row project-row"
            @click="toggleExpand(project.id)"
          >
            <div class="left-cell sticky-cell name-cell">
              <span
                class="chevron"
                :class="{ 'chevron-open': isExpanded(project.id) }"
              >&#8250;</span>
              <span class="project-name" :title="project.name">{{ project.name }}</span>
            </div>
            <div class="tl-cell" :style="tlCellStyle">
              <div
                v-if="todayPx !== null"
                class="today-line"
                :style="{ left: todayPx + 'px' }"
              ></div>
              <div
                v-if="isBarVisible(project)"
                class="bar"
                :class="statusToClass(project.status)"
                :style="getBarStyle(project)"
              >
                <span class="bar-text">
                  <template v-if="sumDays(project) > 0">{{ sumDays(project) }} JH &middot; </template>{{ labelFor(project.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Team sub-rows (expanded) -->
          <template v-if="isExpanded(project.id) && project.teamAllocations && project.teamAllocations.length">
            <div
              v-for="alloc in project.teamAllocations"
              :key="'a-' + (alloc.id || alloc.team.code)"
              class="gantt-row sub-row"
            >
              <div class="left-cell sticky-cell sub-cell">
                <span class="team-avatar" :class="'av-' + alloc.team.code">
                  {{ alloc.team.name.charAt(0) }}
                </span>
                <span class="sub-name">{{ alloc.team.name }}</span>
                <span class="sub-days">{{ alloc.totalDays }} JH</span>
              </div>
              <div class="tl-cell tl-cell--sub" :style="tlCellStyle">
                <div
                  v-if="isBarVisible(project)"
                  class="bar bar--sub"
                  :class="statusToClass(project.status)"
                  :style="getBarStyle(project)"
                >
                  <span class="bar-text">{{ alloc.team.name }} &middot; {{ alloc.totalDays }} JH</span>
                </div>
              </div>
            </div>
          </template>
        </template>

        <!-- Empty state -->
        <div v-if="displayProjects.length === 0 && !loading" class="empty-state">
          Aucun projet à afficher
        </div>

      </div>
    </div>
  </div>
</template>

<script>
const LEFT_WIDTH = 200;
const FR_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function quarterOf(month) {
  return Math.ceil(month / 3);
}
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
function addMonths(year, month, delta) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

const STATUS_LABELS = {
  a_planifier: 'À planifier',
  en_attente_go_client: 'En attente GO',
  recette_po: 'Recette PO',
  en_cours: 'En cours',
  cloture: 'Clôturé',
};
const STATUS_CLASS = {
  a_planifier: 'bar--orange',
  en_attente_go_client: 'bar--orange',
  recette_po: 'bar--green',
  en_cours: 'bar--blue',
  cloture: 'bar--gray',
};

export default {
  props: {
    content: { type: Object, required: true },
  },

  data() {
    return {
      expandedIds: [],
      offsetMonths: 0,
      containerWidth: 1000,
      fetchedData: null,
      loading: false,
      error: null,
    };
  },

  computed: {
    // Data from API takes priority; otherwise the bound `data` property.
    projects() {
      if (Array.isArray(this.fetchedData)) return this.fetchedData;
      const d = this.content && this.content.data;
      return Array.isArray(d) ? d : [];
    },

    displayProjects() {
      return this.projects;
    },

    minMonthWidth() {
      return (this.content && this.content.minMonthWidth) || 90;
    },

    // Stretch months to fill the container; fall back to scrolling when too narrow.
    monthWidth() {
      const count = this.months.length || 1;
      const avail = this.containerWidth - LEFT_WIDTH;
      if (avail <= 0) return this.minMonthWidth;
      return Math.max(this.minMonthWidth, avail / count);
    },

    timelineRange() {
      let sy, sm, ey, em;
      const dates = this.projects.flatMap(p => [
        new Date(p.expectedStartDate),
        new Date(p.expectedEndDate),
      ]).filter(d => !isNaN(d.getTime()));

      if (dates.length) {
        const minD = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxD = new Date(Math.max(...dates.map(d => d.getTime())));
        sy = minD.getFullYear(); sm = minD.getMonth() + 1;
        ey = maxD.getFullYear(); em = maxD.getMonth() + 1;
      } else {
        const now = new Date();
        sy = ey = now.getFullYear();
        sm = now.getMonth() + 1; em = sm + 3;
      }

      const start = addMonths(sy, sm, -1 + this.offsetMonths);
      const end = addMonths(ey, em, 1 + this.offsetMonths);
      return { startYear: start.year, startMonth: start.month, endYear: end.year, endMonth: end.month };
    },

    months() {
      const { startYear, startMonth, endYear, endMonth } = this.timelineRange;
      const now = new Date();
      const cy = now.getFullYear(), cm = now.getMonth() + 1;
      const result = [];
      let y = startYear, m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        result.push({
          year: y, month: m,
          key: `${y}-${m}`,
          label: FR_MONTHS[m - 1],
          isCurrent: y === cy && m === cm,
        });
        const next = addMonths(y, m, 1);
        y = next.year; m = next.month;
        if (result.length > 48) break;
      }
      return result;
    },

    quarters() {
      const groups = [];
      let cur = null;
      this.months.forEach(mo => {
        const label = `T${quarterOf(mo.month)} ${mo.year}`;
        if (!cur || cur.key !== label) {
          cur = { key: label, label, span: 1 };
          groups.push(cur);
        } else {
          cur.span++;
        }
      });
      return groups;
    },

    timelineStart() {
      if (!this.months.length) return new Date();
      const m = this.months[0];
      return new Date(m.year, m.month - 1, 1);
    },
    timelineEnd() {
      if (!this.months.length) return new Date();
      const m = this.months[this.months.length - 1];
      return new Date(m.year, m.month, 0, 23, 59, 59);
    },
    timelineWidth() {
      return this.months.length * this.monthWidth;
    },
    innerWidth() {
      return LEFT_WIDTH + this.timelineWidth;
    },

    tlCellStyle() {
      const mw = this.monthWidth;
      return {
        width: this.timelineWidth + 'px',
        backgroundImage:
          `repeating-linear-gradient(to right, transparent, transparent ${mw - 1}px, #E5E7EB ${mw - 1}px, #E5E7EB ${mw}px)`,
      };
    },

    todayPx() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today < this.timelineStart || today > this.timelineEnd) return null;
      return this.dateToPx(today);
    },
  },

  watch: {
    'content.apiUrl'() { this.fetchData(); },
    'content.dataPath'() { this.fetchData(); },
  },

  mounted() {
    this.measure();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(this.$refs.scrollEl);
    }
    if (typeof window !== 'undefined') window.addEventListener('resize', this.measure);
    this.fetchData();
  },

  beforeUnmount() {
    if (this.ro) this.ro.disconnect();
    if (typeof window !== 'undefined') window.removeEventListener('resize', this.measure);
  },

  methods: {
    measure() {
      const el = this.$refs.scrollEl;
      if (el && el.clientWidth) this.containerWidth = el.clientWidth;
    },

    async fetchData() {
      const url = this.content && this.content.apiUrl;
      if (!url) { this.fetchedData = null; this.error = null; return; }
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let payload = await res.json();
        const path = (this.content && this.content.dataPath || '').trim();
        if (path) {
          path.split('.').forEach(k => { payload = payload != null ? payload[k] : null; });
        }
        this.fetchedData = Array.isArray(payload) ? payload : [];
      } catch (e) {
        this.error = 'Erreur de chargement : ' + e.message;
        this.fetchedData = [];
      } finally {
        this.loading = false;
      }
    },

    isExpanded(id) {
      return this.expandedIds.indexOf(id) >= 0;
    },
    toggleExpand(id) {
      const idx = this.expandedIds.indexOf(id);
      if (idx >= 0) this.expandedIds.splice(idx, 1);
      else this.expandedIds.push(id);
    },

    sumDays(project) {
      return (project.teamAllocations || []).reduce((s, a) => s + (a.totalDays || 0), 0);
    },
    labelFor(status) {
      return STATUS_LABELS[status] || status;
    },
    statusToClass(status) {
      return STATUS_CLASS[status] || 'bar--gray';
    },

    dateToPx(date) {
      let px = 0;
      for (let i = 0; i < this.months.length; i++) {
        const mo = this.months[i];
        const moStart = new Date(mo.year, mo.month - 1, 1);
        const moNextStart = new Date(mo.year, mo.month, 1);
        const days = daysInMonth(mo.year, mo.month);
        if (date < moStart) break;
        if (date >= moNextStart) {
          px += this.monthWidth;
        } else {
          px += ((date.getDate() - 1) / days) * this.monthWidth;
          break;
        }
      }
      return px;
    },

    isBarVisible(project) {
      const s = new Date(project.expectedStartDate);
      const e = new Date(project.expectedEndDate);
      return !isNaN(s.getTime()) && !isNaN(e.getTime()) &&
        e >= this.timelineStart && s <= this.timelineEnd;
    },

    getBarStyle(project) {
      const s = new Date(project.expectedStartDate);
      const e = new Date(project.expectedEndDate);
      const cs = s < this.timelineStart ? new Date(this.timelineStart) : s;
      const ce = e > this.timelineEnd ? new Date(this.timelineEnd) : e;
      const left = this.dateToPx(cs);
      const right = this.dateToPx(ce);
      return {
        left: left + 'px',
        width: Math.max(right - left, this.monthWidth * 0.25) + 'px',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
$left-w:    200px;
$row-h:     48px;
$hdr-h:     30px;
$border:    #E5E7EB;
$sticky-bg: #fff;

.gantt-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #111827;
  background: #fff;
  border: 1px solid $border;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* ─── Banners ─────────────────────────────────── */
.gantt-banner {
  padding: 8px 16px;
  font-size: 12px;
  color: #6B7280;
  background: #F9FAFB;
  border-bottom: 1px solid $border;

  &--error { color: #B91C1C; background: #FEF2F2; }
}

/* ─── Scroll area ─────────────────────────────── */
.gantt-scroll {
  overflow: auto;
  width: 100%;
  max-height: 600px;
  position: relative;
}

.gantt-inner {
  position: relative;
  min-width: 100%;
}

/* ─── Row base ────────────────────────────────── */
.gantt-row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid $border;
  &:last-child { border-bottom: none; }
}

/* ─── Sticky header block ─────────────────────── */
.gantt-header-block {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #F9FAFB;
}

/* ─── Left sticky cell ────────────────────────── */
.left-cell {
  width: $left-w;
  min-width: $left-w;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-right: 2px solid $border;
  box-sizing: border-box;
  background: $sticky-bg;
}

.sticky-cell {
  position: sticky;
  left: 0;
  z-index: 4;
}

.hdr-bg {
  background: #F9FAFB;
  z-index: 11;
}

.nav-cell {
  gap: 6px;
  justify-content: flex-end;
}

/* ─── Timeline header cells ───────────────────── */
.tl-header {
  display: flex;
  flex-shrink: 0;
}

.quarter-cell {
  flex-shrink: 0;
  height: $hdr-h;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  border-right: 1px solid $border;
  &:last-child { border-right: none; }
}

.month-cell {
  flex-shrink: 0;
  height: $hdr-h;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #9CA3AF;
  border-right: 1px solid $border;
  &:last-child { border-right: none; }
  &.is-current { color: #2563EB; font-weight: 700; }
}

/* ─── Nav buttons ─────────────────────────────── */
.nav-btn {
  background: none;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #6B7280;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  &:hover { background: #F3F4F6; color: #111827; }
}

/* ─── Project rows ────────────────────────────── */
.project-row {
  min-height: $row-h;
  cursor: pointer;
  &:hover .name-cell { background: #F9FAFB; }
}

.name-cell {
  gap: 6px;
  transition: background 0.1s;
}

.chevron {
  font-size: 14px;
  color: #9CA3AF;
  flex-shrink: 0;
  transition: transform 0.15s;
  display: inline-block;
  &.chevron-open { transform: rotate(90deg); }
}

.project-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* ─── Sub-rows ────────────────────────────────── */
.sub-row {
  min-height: 40px;
  background: #FAFAFA;
  .sticky-cell { background: #FAFAFA; }
}

.sub-cell {
  padding-left: 28px;
  gap: 6px;
  background: #FAFAFA;
}

.sub-name {
  flex: 1;
  font-size: 12px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-days {
  font-size: 11px;
  color: #9CA3AF;
  flex-shrink: 0;
}

.team-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  background: #9CA3AF;
  &.av-dev    { background: #3B82F6; }
  &.av-bi     { background: #8B5CF6; }
  &.av-design { background: #F59E0B; }
  &.av-data   { background: #10B981; }
}

/* ─── Timeline cell ───────────────────────────── */
.tl-cell {
  flex-shrink: 0;
  min-height: $row-h;
  position: relative;
  box-sizing: border-box;
  &.tl-cell--sub { min-height: 40px; }
}

/* ─── Today line ──────────────────────────────── */
.today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #EF4444;
  z-index: 2;
  pointer-events: none;
}

/* ─── Gantt bars ──────────────────────────────── */
.bar {
  position: absolute;
  top: 8px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  z-index: 1;
  overflow: hidden;
  cursor: default;
  transition: filter 0.1s;
  &:hover { filter: brightness(1.08); }

  &.bar--orange { background: #F07050; }
  &.bar--green  { background: #4CAF50; }
  &.bar--blue   { background: #3B82F6; }
  &.bar--gray   { background: #9CA3AF; }

  &.bar--sub {
    top: 6px;
    height: 22px;
    opacity: 0.5;
    border-radius: 4px;
  }
}

.bar-text {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  user-select: none;
}

/* ─── Empty state ─────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #9CA3AF;
  font-size: 13px;
}
</style>
