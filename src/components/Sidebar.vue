<template>
  <aside class="sidebar">
    <header class="sidebar-header">
      <span class="sidebar-logo">OPERATIVA</span>
    </header>
    <ul class="sidebar-menu">
      <li
        v-for="(item, index) in menuItems"
        :key="index"
        :class="['sidebar-item', { active: item.page === activePage, 'has-children': item.children }]"
      >
        <div class="menu-item-content" @click="item.children ? toggleSubmenu(index) : navigate(item.page)">
          <i :class="item.icon"></i>
          <span class="menu-label">{{ item.label }}</span>
          <i v-if="item.children" :class="['arrow-icon', item.isOpen ? 'bi bi-chevron-down' : 'bi bi-chevron-right']"></i>
        </div>
        <ul v-if="item.children && item.isOpen" class="submenu">
          <li
            v-for="(subItem, subIndex) in item.children"
            :key="subIndex"
            :class="['sidebar-item', { active: subItem.page === activePage }]"
            @click.stop="navigate(subItem.page)"
          >
            {{ subItem.label }}
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  props: ['activePage'],
  data() {
    return {
      menuItems: [
        { label: 'Inicio', page: 'home', icon: 'bi bi-house' },
        {
          label: 'Programación Lineal',
          icon: 'bi bi-calculator',
          isOpen: false, // Estado para controlar si el submenú está abierto
          children: [
            { label: 'Método Simplex', page: 'simplex' },
            { label: 'Método de la Gran M', page: 'granm' },
            { label: 'Método de Dos Fases', page: 'dosfases' },
            { label: 'Método Dual', page: 'dual' },
          ],
        },
        {
          label: 'Transporte',
          icon: 'bi bi-truck',
          isOpen: false, // Estado para controlar si el submenú está abierto
          children: [
            { label: 'Esquina Noroeste', page: 'esquina' },
            { label: 'Costo Mínimo', page: 'costo-minimo' },
            { label: 'Método de Vogel', page: 'vogel' },
          ],
        },
        {
          label: 'Redes',
          icon: 'bi bi-diagram-3',
          isOpen: false, // Estado para controlar si el submenú está abierto
          children: [
            { label: 'Camino Más Corto', page: 'caminocorto' },
            { label: 'Flujo Máximo', page: 'flujomaximo' },
            { label: 'Árbol de Expansión Mínima', page: 'arbol' },
            { label: 'Flujo Costo Mínimo', page: 'flujominimo' },
          ],
        },
      ],
    };
  },
  methods: {
    toggleSubmenu(index) {
      // Cambia el estado de abierto/cerrado del submenú
      this.menuItems[index].isOpen = !this.menuItems[index].isOpen;
    },
    navigate(page) {
      this.$emit('navigate', page);
    },
  },
};
</script>

<style scoped>
/* Estilos generales del sidebar */
.sidebar {
  width: 280px;
  background-color: #2c3e50;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  transition: width 0.3s ease;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #34495e;
}

.sidebar-logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #3498db;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.sidebar-item {
  padding: 0;
  cursor: pointer;
  color: white;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.menu-item-content {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.menu-item-content:hover {
  background-color: #34495e;
}

.sidebar-item.active .menu-item-content {
  background-color: #3498db;
  color: white;
}

.sidebar-item i {
  margin-right: 10px;
  font-size: 1.2rem;
  color: #3498db;
}

.sidebar-item.active i {
  color: white;
}

.menu-label {
  flex-grow: 1;
}

.arrow-icon {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.has-children .arrow-icon {
  margin-left: auto;
}

/* Submenús con niveles */
.submenu {
  list-style: none;
  padding-left: 30px; /* Desplazamiento para indicar nivel */
  margin: 0;
  border-left: 2px solid #3498db; /* Línea vertical para indicar jerarquía */
  background-color: #34495e; /* Fondo para diferenciar niveles */
}

.submenu .sidebar-item {
  padding: 10px 20px;
  font-size: 0.9rem;
  background-color: transparent;
  position: relative;
}

.submenu .sidebar-item::before {
  content: '';
  position: absolute;
  left: -15px;
  top: 50%;
  width: 10px;
  height: 2px;
  background-color: #3498db;
}

.submenu .sidebar-item.active {
  background-color: #2980b9;
}

.submenu .sidebar-item:hover {
  background-color: #2c3e50;
}

/* Animaciones */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-item {
  animation: slideIn 0.3s ease-out;
}
</style>