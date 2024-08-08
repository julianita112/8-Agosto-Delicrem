import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function CategoriaInsumos() {
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriasPerPage] = useState(6);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categorias_insumo");
      setCategorias(response.data);
      setFilteredCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  };

  useEffect(() => {
    filterCategorias();
  }, [search, categorias]);

  const filterCategorias = () => {
    const filtered = categorias.filter((categoria) =>
      categoria.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCategorias(filtered);
  };

  const handleOpen = () => {
    setOpen(!open);
    setErrors({});
  };

  const handleDetailsOpen = () => {
    setDetailsOpen(!detailsOpen);
  };

  const handleEdit = (categoria) => {
    setSelectedCategoria(categoria);
    setEditMode(true);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategoria({
      nombre: "",
      descripcion: "",
    });
    setEditMode(false);
    setOpen(true);
  };

  const handleDelete = async (categoria) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la categoría ${categoria.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000000',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/categorias_insumo/${categoria.id_categoria}`);
        fetchCategorias();
        
        Swal.fire({
          icon: 'success',
          title: 'Categoría eliminada',
          text: 'La categoría ha sido eliminada exitosamente.',
          confirmButtonText: 'Aceptar',
          background: '#f0f4f8',
          iconColor: '#28a745',
          confirmButtonColor: '#007bff',
          customClass: {
            title: 'text-lg font-semibold',
            icon: 'text-2xl',
            confirmButton: 'px-4 py-2 text-white'
          }
        });
    
      } catch (error) {
        console.error("Error deleting categoria:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: 'Esta categoría de insumos no se puede eliminar ya que se encuentra asociada a una compra y/o a un insumo.',
          confirmButtonText: 'Aceptar',
          background: '#ffff',
          iconColor: '#A62A64 ',
          confirmButtonColor: '#000000',
          customClass: {
            title: 'text-lg font-semibold',
            icon: 'text-2xl',
            confirmButton: 'px-4 py-2 text-white'
          }
        });
      }
    }
  }
    

  const handleSave = async () => {
    try {
      const regex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜ\s]+$/;
      const errors = {};

      if (!selectedCategoria.nombre.trim()) {
        errors.nombre = "Por favor, ingrese el nombre de la categoría de insumos.";
      } else if (!regex.test(selectedCategoria.nombre)) {
        errors.nombre = "El nombre solo puede contener letras y espacios.";
      }

      if (!selectedCategoria.descripcion.trim()) {
        errors.descripcion = "Por favor, ingrese la descripción de la categoría.";
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      if (editMode) {
        await axios.put(`http://localhost:3000/api/categorias_insumo/${selectedCategoria.id_categoria}`, selectedCategoria);
        setOpen(false);
        fetchCategorias();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "Categoría editada exitosamente"
        });
      } else {
        await axios.post("http://localhost:3000/api/categorias_insumo", selectedCategoria);
        fetchCategorias();
        setOpen(false);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "Categoría creada exitosamente"
        });
      }
    } catch (error) {
      console.error("Error saving categoria:", error);
      Swal.fire('Error', 'Hubo un problema al guardar la categoría.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategoria({ ...selectedCategoria, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (categoria) => {
    setSelectedCategoria(categoria);
    setDetailsOpen(true);
  };

  const handleToggleEstado = async (categoria) => {
    try {
      await axios.patch(`http://localhost:3000/api/categorias_insumo/${categoria.id_categoria}/estado`, {
        activo: !categoria.activo,
      });
      fetchCategorias();
    } catch (error) {
      console.error("Error updating estado:", error);
    }
  };

  const indexOfLastCategoria = currentPage * categoriasPerPage;
  const indexOfFirstCategoria = indexOfLastCategoria - categoriasPerPage;
  const currentCategorias = filteredCategorias.slice(indexOfFirstCategoria, indexOfLastCategoria);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredCategorias.length / categoriasPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Categoría de Insumos
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre de insumo..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-1">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Categorías de Insumo
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCategorias.map((categoria) => (
                    <tr key={categoria.id_categoria}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{categoria.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoria.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleToggleEstado(categoria)}
                          className={`w-10 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                            categoria.activo ? "bg-green-400" : "bg-red-400"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                              categoria.activo ? "translate-x-4" : ""
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <IconButton
                            className="btnedit"
                            size="sm"
                            onClick={() => handleEdit(categoria)}
                            disabled={!categoria.activo}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            className="btncancelarinsumo"
                            size="sm"
                            onClick={() => handleDelete(categoria)}
                            disabled={!categoria.activo}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            className="btnvisualizar"
                            size="sm"
                            onClick={() => handleViewDetails(categoria)}
                            disabled={!categoria.activo}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <ul className="flex justify-center items-center space-x-2">
                {pageNumbers.map((number) => (
                  <Button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination ${number === currentPage ? "active" : ""}`}
                    size="sm"
                  >
                    {number}
                  </Button>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
      
      <Dialog open={open} handler={handleOpen} className="max-w-md w-10/12 p-5 bg-white rounded-2xl shadow-lg" size="xs">
        <DialogHeader className="text-xl font-bold text-gray-800">
          {editMode ? "Editar Categoría de Insumos" : "Crear Categoría de Insumos"}
        </DialogHeader>
        <DialogBody divider>
          <div className="space-y-3">
            <Input
              label="Nombre de la categoría"
              name="nombre"
              value={selectedCategoria.nombre}
              onChange={handleChange}
              required
              error={errors.nombre}
              className="w-full"
            />
            {errors.nombre && <Typography color="red" className="text-xs">{errors.nombre}</Typography>}
            <Input
              label="Descripción"
              name="descripcion"
              value={selectedCategoria.descripcion}
              onChange={handleChange}
              required
              error={errors.descripcion}
              className="w-full"
            />
            {errors.descripcion && <Typography color="red" className="text-xs">{errors.descripcion}</Typography>}
          </div>
        </DialogBody>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="text" className="btncancelarinsumom" size="sm" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" className="btnagregar" color="green" size="sm" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Categoría"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={detailsOpen} handler={handleDetailsOpen} className="max-w-xs w-11/12" size="xs">
        <DialogHeader className="text-xxl font-bold text-gray-800">
          Detalles de la Categoría
        </DialogHeader>
        <DialogBody>
          <div className="space-y-2">
            <Typography variant="subtitle2" className="font-bold text-gray-800">Nombre:</Typography>
            <Typography className="text-sm">{selectedCategoria.nombre}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Descripción:</Typography>
            <Typography className="text-sm">{selectedCategoria.descripcion}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Creado:</Typography>
            <Typography className="text-sm">{selectedCategoria.createdAt ? new Date(selectedCategoria.createdAt).toLocaleString() : 'N/A'}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Actualizado:</Typography>
            <Typography className="text-sm">{selectedCategoria.updatedAt ? new Date(selectedCategoria.updatedAt).toLocaleString() : 'N/A'}</Typography>
            {selectedCategoria.insumos && (
              <>
                <Typography variant="subtitle2" className="font-bold text-gray-800">Insumos:</Typography>
                {selectedCategoria.insumos.map((insumo) => (
                  <Typography key={insumo.id_insumo} className="text-sm">
                    {insumo.nombre} (Stock: {insumo.stock_actual})
                  </Typography>
                ))}
              </>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button className="btncancelarm" size="sm" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
