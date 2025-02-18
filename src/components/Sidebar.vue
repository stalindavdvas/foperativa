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
        @click="item.children ? toggleSubmenu(index) : navigate(item.page)"
      >
        <i :class="item.icon"></i> {{ item.label }}
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
          children: [
            { label: 'Esquina Noroeste', page: 'esquina' },
            { label: 'Costo Mínimo', page: 'costo-minimo' },
            { label: 'Método de Vogel', page: 'vogel' },
          ],
        },
        {
          label: 'Redes',
          icon: 'bi bi-diagram-3',
          children: [
            { label: 'Camino Más Corto', page: 'caminocorto' },
            { label: 'Flujo Máximo', page: 'flujomaximo' },
            { label: 'Árbol de Expansión Mínima', page: 'arbol' },
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
.sidebar {
  width: 250px;
  background-color: #333;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #444;
}

.sidebar-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.sidebar-item {
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: white;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.sidebar-item:hover {
  background-color: #555;
}

.sidebar-item.active {
  background-color: #007bff;
}

.sidebar-item i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.has-children {
  cursor: pointer;
}

.submenu {
  padding-left: 20px;
  list-style: none;
  display: block;
}

.submenu .sidebar-item {
  padding: 10px 20px;
  font-size: 0.9rem;
  background-color: #444;
}

.submenu .sidebar-item.active {
  background-color: #0056b3;
}

.submenu .sidebar-item:hover {
  background-color: #555;
}
</style>
